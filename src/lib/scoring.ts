export type ResultType = "EXACT" | "WINNER" | "WRONG";

export interface Score {
  home: number;
  away: number;
}

export interface ScoringConfig {
  exact: number;
  winner: number;
}

export function getResultType(prediction: Score, real: Score): ResultType {
  if (prediction.home === real.home && prediction.away === real.away) {
    return "EXACT";
  }
  const predWinner = Math.sign(prediction.home - prediction.away);
  const realWinner = Math.sign(real.home - real.away);
  if (predWinner === realWinner) {
    return "WINNER";
  }
  return "WRONG";
}

export function calculatePoints(
  prediction: Score,
  real: Score,
  config: ScoringConfig = { exact: 5, winner: 2 }
): { points: number; resultType: ResultType } {
  const resultType = getResultType(prediction, real);
  const points =
    resultType === "EXACT"
      ? config.exact
      : resultType === "WINNER"
      ? config.winner
      : 0;
  return { points, resultType };
}
