import io
import logging
import re
from typing import List

import pdfplumber

LOGGER = logging.getLogger(__name__)

COMMON_SKILLS = {
    # Programming Languages
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "go",
    "rust",
    "scala",
    "kotlin",
    "swift",
    "r",
    "bash",
    "shell scripting",
    "powershell",
    "ruby",
    "php",
    # Backend
    "fastapi",
    "django",
    "flask",
    "spring boot",
    "node.js",
    "express.js",
    "nestjs",
    "asp.net",
    "laravel",
    "ruby on rails",
    # Frontend
    "react",
    "next.js",
    "vue.js",
    "nuxt.js",
    "angular",
    "svelte",
    "redux",
    "tailwind css",
    "bootstrap",
    "material ui",
    "html",
    "css",
    # Databases SQL
    "sql",
    "postgresql",
    "mysql",
    "mariadb",
    "sqlite",
    "sql server",
    "oracle",
    "snowflake",
    "redshift",
    "bigquery",
    # Databases NoSQL
    "mongodb",
    "dynamodb",
    "cassandra",
    "redis",
    "neo4j",
    "couchdb",
    "elasticsearch",
    "firebase",
    # Data Engineering
    "apache spark",
    "pyspark",
    "hadoop",
    "airflow",
    "kafka",
    "flink",
    "dbt",
    "delta lake",
    "databricks",
    "etl",
    "data engineering",
    # Python Data Libraries
    "pandas",
    "numpy",
    "dask",
    "polars",
    "scipy",
    # AI / Machine Learning
    "machine learning",
    "deep learning",
    "pytorch",
    "tensorflow",
    "keras",
    "scikit-learn",
    "xgboost",
    "lightgbm",
    "huggingface",
    "transformers",
    "natural language processing",
    "computer vision",
    # LLM / GenAI
    "large language models",
    "llm",
    "rag",
    "semantic search",
    "embeddings",
    "vector search",
    "prompt engineering",
    "agentic ai",
    "langchain",
    "langgraph",
    "crewai",
    "autogen",
    # Vector Databases
    "pinecone",
    "weaviate",
    "milvus",
    "qdrant",
    "faiss",
    "chromadb",
    "pgvector",
    # Cloud Platforms
    "aws",
    "azure",
    "gcp",
    # AWS
    "aws ec2",
    "aws s3",
    "aws lambda",
    "aws ecs",
    "aws eks",
    "aws fargate",
    "aws api gateway",
    "aws cloudwatch",
    "aws iam",
    "aws secrets manager",
    "aws rds",
    "aws dynamodb",
    "aws sns",
    "aws sqs",
    "aws glue",
    "aws athena",
    "aws redshift",
    # Azure
    "azure functions",
    "azure openai",
    "azure blob storage",
    "azure synapse",
    "azure data factory",
    "azure kubernetes service",
    "azure devops",
    "azure sql",
    "azure cosmos db",
    # DevOps
    "docker",
    "kubernetes",
    "terraform",
    "ansible",
    "jenkins",
    "github actions",
    "gitlab ci",
    "circleci",
    "argocd",
    "helm",
    "ci/cd",
    # APIs
    "rest api",
    "graphql",
    "grpc",
    "websockets",
    "oauth",
    "oauth2",
    "jwt",
    "openapi",
    "swagger",
    "webhooks",
    # Testing
    "pytest",
    "unittest",
    "jest",
    "mocha",
    "cypress",
    "selenium",
    "playwright",
    "junit",
    "testng",
    # Messaging / Streaming
    "rabbitmq",
    "apache kafka",
    "redis streams",
    "aws sqs",
    "aws sns",
    "google pubsub",
    # Security
    "saml",
    "rbac",
    "encryption",
    "ssl",
    "tls",
    "hashing",
    "secrets management",
    # Observability
    "prometheus",
    "grafana",
    "datadog",
    "elk stack",
    "opentelemetry",
    "sentry",
    "new relic",
    # Version Control
    "git",
    "github",
    "gitlab",
    "bitbucket",
    # Architecture
    "microservices",
    "serverless",
    "event driven architecture",
    "distributed systems",
    "domain driven design",
    "clean architecture",
    # OS
    "linux",
    "unix",
    "macos",
    "windows",
    # File Processing / OCR
    "pdf processing",
    "ocr",
    "tesseract",
    "opencv",
    "pdfplumber",
    "pypdf",
    "pypdfium2",
    "openpyxl",
    "excel processing",
    "csv processing",
}

ALIASES = {
    "nextjs": "next.js",
    "nodejs": "node.js",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "dl": "deep learning",
    "llms": "llm",
    "rag pipeline": "rag",
    "postgres": "postgresql",
    "postgre": "postgresql",
    "mongo": "mongodb",
    "tf": "tensorflow",
    "sklearn": "scikit-learn",
    "pytorch lightning": "pytorch",
    "aws lambda functions": "aws lambda",
    "aws ecs fargate": "aws fargate",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    "github": "github actions",
    "restful api": "rest api",
    "restful apis": "rest api",
    "vector db": "vector search",
    "vector database": "vector search",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    LOGGER.info("Starting PDF text extraction")
    full_text = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            LOGGER.info("Extracted text from page %s", idx)
            full_text.append(text)
    combined = "\n".join(full_text).strip()
    LOGGER.info("Completed PDF extraction. Characters extracted: %s", len(combined))
    return combined


def normalize_text(text: str) -> str:
    clean = text.lower()
    clean = re.sub(r"[^a-z0-9+.#/\-\s]", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def extract_skills(text: str) -> List[str]:
    normalized = normalize_text(text)
    found = set()

    for raw_token in normalized.split():
        mapped = ALIASES.get(raw_token, raw_token)
        if mapped in COMMON_SKILLS:
            found.add(mapped)

    for skill in COMMON_SKILLS:
        if " " in skill or "." in skill or "/" in skill:
            if skill in normalized:
                found.add(skill)

    sorted_skills = sorted(found)
    LOGGER.info("Extracted %s skills", len(sorted_skills))
    return sorted_skills
