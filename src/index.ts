import { Algebra, Util } from "sparqlalgebrajs";
import type { TypedOperation } from "sparqlalgebrajs/lib/algebra";

function generate_recursive_operation_callback(): [RecursiveOperationCallbackRecord, IQueryStatistic] {
    const stats: IQueryStatistic = {
        number_bgp: 0,
        number_triple_patterns: 0,
        number_optional: 0,
        number_property_path: 0,
        number_recursive_property_path: 0,
        number_union: 0,
        number_union_with_multiple_triple_triple_patterns: 0,
        number_distinct: 0,
        number_limit: 0
    };
    const operations: RecursiveOperationCallbackRecord = {
        [Algebra.types.BGP]: () => {
            ++stats.number_bgp;
            return true;
        },
        [Algebra.types.PATTERN]: () => {
            ++stats.number_triple_patterns;
            return true;
        },
        [Algebra.types.PATH]: () => {
            ++stats.number_triple_patterns;
            return true;
        },
        [Algebra.types.LEFT_JOIN]: () => {
            ++stats.number_optional;
            return true;
        },
        [Algebra.types.INV]: () => {
            ++stats.number_property_path;
            return true;
        },
        [Algebra.types.SEQ]: () => {
            ++stats.number_property_path;
            return true;
        },
        [Algebra.types.ALT]: () => {
            ++stats.number_property_path;
            return true;
        },
        [Algebra.types.ZERO_OR_MORE_PATH]: () => {
            ++stats.number_property_path;
            ++stats.number_recursive_property_path;
            return true;
        },
        [Algebra.types.ONE_OR_MORE_PATH]: () => {
            ++stats.number_property_path;
            ++stats.number_recursive_property_path;
            return true;
        },
        [Algebra.types.ZERO_OR_ONE_PATH]: () => {
            ++stats.number_property_path;
            return true;
        },
        [Algebra.types.NPS]: () => {
            ++stats.number_property_path;
            return true;
        },
        [Algebra.types.UNION]: (op: Algebra.Union) => {
            ++stats.number_union;
            for (const gp of op.input) {
                let number_tp = 0;
                Util.recurseOperation(gp, {
                    [Algebra.types.PATTERN]: () => {
                        ++number_tp;
                        return true;
                    },
                    [Algebra.types.PATH]: () => {
                        ++number_tp;
                        return true;
                    },
                });
                if (number_tp > 1) {
                    ++stats.number_union_with_multiple_triple_triple_patterns;
                }
            }
            return true;
        },
        [Algebra.types.DISTINCT]: () => {
            ++stats.number_distinct;
            return true;
        },
        [Algebra.types.SLICE]: (op: Algebra.Slice) => {
            if (op.start === 0) {
                ++stats.number_limit;
            }
            return true;
        }
    };

    return [operations, stats];
}

export function calculate_statistic(query: Algebra.Operation): IQueryStatistic {
    const [op, stats] = generate_recursive_operation_callback();
    Util.recurseOperation(query, op);
    return stats;
}

export interface IQueryStatistic {
    number_triple_patterns: number,
    number_bgp: number,
    number_optional: number,
    number_property_path: number,
    number_recursive_property_path: number,
    number_union: number,
    number_union_with_multiple_triple_triple_patterns: number,
    number_distinct: number,
    number_limit: number,
}

type RecursiveOperationCallbackRecord = {
    [T in Algebra.types]?: (op: TypedOperation<T>) => boolean
}