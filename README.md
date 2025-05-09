# query-stats-sparql

![npm version](https://img.shields.io/npm/v/query-stats-sparql)
![Unit Tests Status](https://img.shields.io/github/actions/workflow/status/constraintAutomaton/query-stats-sparql.js/ci.yml?label=unit+test
)

A simple library to extract basic statistics from SPARQL queries.

## Install
To install dependencies:

```bash
bun install
```
## Usage

```ts
import { calculate_statistic} from "query-stats-sparql";
import { translate } from "sparqlalgebrajs";

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

const stats = calculate_statistic(query);

/**
 {
  number_bgp: 2,
  number_triple_patterns: 3,
  number_optional: 0,
  number_property_path: 0,
  number_recursive_property_path: 0,
  number_union: 0,
  number_distinct: 0,
  number_limit: 0,
}
*/ 
console.log(stats);

```
