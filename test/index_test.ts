import { describe, expect, it } from "bun:test";
import { calculate_statistic, type IQueryStatistic } from "../src";
import { translate } from "sparqlalgebrajs";

describe(calculate_statistic.name, () => {
    it("should calculate statistic with a simple query", () => {
        const query = translate("SELECT * WHERE {?s ?p ?o}");
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 1,
            number_triple_patterns: 1,

        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with multiple triple patterns", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            ?s <ex:a> <ex:b>.
            ?p <ex:b> <ex:c>.

            }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 1,
            number_triple_patterns: 3,

        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with multiple BGPs", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            {
                SELECT ?s ?p WHERE {
                    ?s ex:a ex:b.
                    ?p ex:b ex:c.
                }
            }
        }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 2,
            number_triple_patterns: 3,

        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with optional", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            
                OPTIONAL {
                    ?s ex:a ex:b.
                    ?p ex:b ex:c.
                }
            
        }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 2,
            number_optional: 1,
            number_triple_patterns: 3,

        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with property paths", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            ?s <ex:a>? <ex:b>.
            ?p <ex:b>|<ex:e> <ex:c>.
            }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 1,
            number_triple_patterns: 3,
            number_property_path: 2,
        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with recursive property paths", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            ?s <ex:a>* <ex:b>.
            ?p <ex:b>|<ex:e> <ex:c>.
            }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 1,
            number_triple_patterns: 3,
            number_property_path: 2,
            number_recursive_property_path: 1
        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with unions", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
        {
            ?s ?p ?o.
        }
        UNION {
            ?s <ex:a> <ex:b>.
            ?p <ex:b> <ex:c>.
        }
        UNION {
            <ex:a> ?p ?o.
        }

        ?s ?p ?o.

        {
            <ex:d> <ex:a> ?v.
        }
        UNION {
            <ex:d> <ex:a> ?k.
        }
        }
        `);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 6,
            number_triple_patterns: 7,
            number_union:2
        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with multiple distinct", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT DISTINCT * WHERE {
            ?s ?p ?o.
            {
                SELECT DISTINCT ?s ?p WHERE {
                    ?s ex:a ex:b.
                    ?p ex:b ex:c.
                }
            }
        }`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 2,
            number_triple_patterns: 3,
            number_distinct:2
        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });

    it("should calculate statistic of a query with multiple limit", () => {
        const query = translate(`
        PREFIX ex: <http://example.org/>

        SELECT * WHERE {
            ?s ?p ?o.
            {
                SELECT ?s ?p WHERE {
                    ?s ex:a ex:b.
                    ?p ex:b ex:c.
                } LIMIT 2
            }
        } LIMIT 10`);
        const resp = calculate_statistic(query);

        const expected_statistic: Partial<IQueryStatistic> = {
            number_bgp: 2,
            number_triple_patterns: 3,
            number_limit:2
        }

        expect(resp).toStrictEqual(build_statistic(expected_statistic))
    });
});

function build_statistic(stat: Partial<IQueryStatistic>): IQueryStatistic {
    const newStat = JSON.parse(JSON.stringify(stat));

    for (const key of keysIQueryStatistic) {
        if (newStat[key] === undefined) {
            newStat[key] = 0;
        }
    }
    return newStat;
}

const keysIQueryStatistic: (keyof IQueryStatistic)[] = [
    "number_triple_patterns",
    "number_bgp",
    "number_optional",
    "number_property_path",
    "number_recursive_property_path",
    "number_union",
    "number_distinct",
    "number_limit"
] as const;
