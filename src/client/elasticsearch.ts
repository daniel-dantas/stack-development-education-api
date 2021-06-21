import elasticsearch from "elasticsearch";

export const getClient = () => {
    return new elasticsearch.Client({
        host: "localhost:9200",
        log: "trace"
    });
}