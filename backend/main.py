from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import lancedb
import torch
from lancedb.embeddings import get_registry
from lancedb.pydantic import LanceModel, Vector
import os
from dotenv import load_dotenv
import requests
from openai import OpenAI


DB_URI = "data/lancedb"
COURT_CASE_OPINIONS_TABLE_NAME = "court_case_opinions"
IDEAL_CASES_TO_FETCH = 50
CASES_TO_DISPLAY = 5
ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://localhost:4173",
    "https://hackharvard24.pages.dev/",
]
CHATGPT_MODEL = "gpt-4o-mini"

load_dotenv()
cl_api_key = os.getenv("COURT_LISTENER_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
db = lancedb.connect("data/lancedb")
embedding_model = (
    get_registry()
    .get("sentence-transformers")
    .create(name="all-MiniLM-L6-v2", device=str(device))
)
openai_client = OpenAI(api_key=openai_api_key)


# Set up LanceDB schema with Embedding API for automatic vectorization at ingestion and query time!
# Each schema can have multiple source and vector fields
class Embedding(LanceModel):
    vector: Vector(embedding_model.ndims()) = embedding_model.VectorField()  # type: ignore
    absolute_url: str
    attorney: str
    caseName: str
    caseNameFull: str
    cluster_id: int
    court: str
    court_citation_string: str
    court_id: str
    dateFiled: str
    docket_id: int
    judge: str
    opinions: list[tuple[str, str, str, str]] = embedding_model.SourceField()
    """List of tuples of opinion's download url, stringified id, snippet, and type"""
    syllabus: str = embedding_model.SourceField()


# class EmbeddingColumns(BaseModel):
#     opinions: List[Tuple[str, str, str, str]]
#     syllabus: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run on startup
    db.create_table(
        COURT_CASE_OPINIONS_TABLE_NAME,
        exist_ok=True,
        schema=Embedding,
    )
    yield
    # Run on shutdown
    tbl = db.open_table(COURT_CASE_OPINIONS_TABLE_NAME)
    tbl.compact_files()
    # db.drop_database()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


def generate_revelant_summary(opinion_download_url: str, query: str, snippet: str):
    response = (
        openai_client.chat.completions.create(
            model=CHATGPT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": f'Understand this following court case opinion: {opinion_download_url}. Then generate a title for this opinion that is relevant to the query: {query}, and snippet from the linked opinion: {snippet}. <mark></mark> elements are words highlighted from the search query. Don\'t include the beginning "Title: "',
                        }
                    ],
                }
            ],
            max_tokens=30,
        )
        .choices[0]
        .message.content
    )
    return response or ""


@app.get("/opinions/most-relevant")
def get_most_relevant_court_case_opinions(
    query: str,
    vector_column_name: str | None = None,
):
    basicized_query = (
        openai_client.chat.completions.create(
            model=CHATGPT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": f"You are a legal researcher looking for the most relevant court case opinions to your query: {query}.You are also using CourtListener search engine that allows you to search for court case opinions across hundreds of jurisdictions. The only limitation is that it is a very basic search engine. Skim your human query down to yield the most relevant results from the search engine. Don't include the beginning 'Search Query: '",
                        }
                    ],
                }
            ],
            max_tokens=20,
        )
        .choices[0]
        .message.content
    )

    tbl = db.open_table(COURT_CASE_OPINIONS_TABLE_NAME)

    # call court listener api to get the 25 most relevant court case opinions (according to them)
    type = "o"  # case law opinions. See https://www.courtlistener.com/help/api/rest/search/#type
    # result_type = "r"  # also maybe this, List of Federal cases with up to three nested documents
    order_by = "score desc"
    stat_Precedential = "on"
    highlight = "on"
    print(basicized_query)
    url = f"https://www.courtlistener.com/api/rest/v4/search/?q={basicized_query}&type={type}&order_by={order_by}&stat_Precedential={stat_Precedential}&highlight={highlight}"
    print(url)
    headers = {"Authorization": f"Token {cl_api_key}"}

    cases_fetched = 0

    while url is not None and cases_fetched < IDEAL_CASES_TO_FETCH:
        response = requests.get(url, headers=headers)
        data = response.json()
        print(data)

        if data["count"] == 0 or not data.get("results"):
            return []

        cases_fetched += len(data["results"])

        print("cases fetched: ", cases_fetched)
        print("rows: ", tbl.count_rows())
        # print("HEEY: ", data["results"][0]["opinions"][0]["download_url"])
        # print(type(data["results"][0]["opinions"][0]["download_url"]))

        # performs a "upsert" operation on the docket_id column, drop on bad vectors

        tbl.merge_insert(
            "docket_id",
        ).when_matched_update_all().when_not_matched_insert_all().execute(
            [
                {
                    "absolute_url": result["absolute_url"],
                    "attorney": result["attorney"],
                    "caseName": result["caseName"],
                    "caseNameFull": result["caseNameFull"],
                    "cluster_id": result["cluster_id"],
                    "court": result["court"],
                    "court_citation_string": result["court_citation_string"],
                    "court_id": result["court_id"],
                    "dateFiled": result["dateFiled"],
                    "docket_id": result["docket_id"],
                    "judge": result["judge"],
                    "opinions": [
                        (
                            opinion["download_url"] if opinion["download_url"] else "",
                            str(opinion["id"]),
                            opinion["snippet"],
                            opinion["type"],
                        )
                        for opinion in result["opinions"]
                    ],
                    "syllabus": result["syllabus"],
                }
                for result in data["results"]
            ],
            on_bad_vectors="drop",
        )
        print("rows: ", tbl.count_rows())

        # Update the URL to the next page
        url = data["next"]
        print("next url: ", url)

    # similarized_opinion = (
    #     openai_client.beta.chat.completions.parse(
    #         model=CHATGPT_MODEL,
    #         messages=[
    #             {
    #                 "role": "system",
    #                 "content": f"Produce JSON! Extract a single embedding input, following these examples: {example_embedding_inputs}. The opinion tuple should contain the download url, stringified id, snippet, and type of the opinion.",
    #             },
    #             {
    #                 "role": "user",
    #                 "content": f"As a legal researcher, I am looking for court case opinions that are relevant to the query: {query}.",
    #             },
    #         ],
    #         max_tokens=100,
    #         response_format={"type": "json_object"},
    #         # response_format=EmbeddingColumns,
    #     )
    #     .choices[0]
    #     .message.parsed
    # )
    # print(similarized_opinion)
    # if similarized_opinion is None:
    #     similarized_opinion = basicized_query

    print("STUCK HERE")
    results = (
        tbl.search(basicized_query, vector_column_name)
        .limit(CASES_TO_DISPLAY)
        .to_list()
        # .to_pydantic(Embedding)
    )
    for result in results:
        result.pop("vector")
        for i, opinion in enumerate(result["opinions"]):
            opinion[0] = None if opinion[0] == "" else opinion[0]
            opinion[1] = int(opinion[1])

        new_opinions = [
            {
                "download_url": opinion[0],
                "id": opinion[1],
                "snippet": generate_revelant_summary(opinion[0], query, opinion[2]),
                "type": opinion[3],
            }
            for opinion in result["opinions"]
        ]
        result["opinions"] = new_opinions
    return results
