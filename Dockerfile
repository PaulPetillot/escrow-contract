FROM postgres:13-alpine

ENV POSTGRES_USER user
ENV POSTGRES_PASSWORD user
ENV POSTGRES_DB contractdb

COPY init.sql /docker-entrypoint-initdb.d/
