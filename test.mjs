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
 * 
 */ 
console.log(stats);