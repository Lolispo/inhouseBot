'use strict;'

function eloupdate(t1mmr, t2mmr, winner){
  const K = 32;
  //transformed ratings for t1 and t2
  var t1_trans = Math.pow(10, t1mmr/400);
  var t2_trans = Math.pow(10, t2mmr/400);

  //estimated ratings for t1 and t2
  var est1 = t1_trans / (t1_trans+t2_trans);
  var est2 = t2_trans / (t1_trans+t2_trans);

  //actual score of winner
  var score1 = 0;
  var score2 = 0;

  switch(winner){
    case 1:
      score1 = 1;
      break;
    case 2:
      score2 = 1;
      break;
    default:
      //draw
      score1 = 0.5;
      score2 = 0.5;
  }

  //new mmr for t1 and t2
  t1_new = t1mmr + K * (score1 - est1);
  t2_new = t2mrr + K * (score2 - est2);

  return {
    "1": t1_new,
    "2": t2_new
  };
}
