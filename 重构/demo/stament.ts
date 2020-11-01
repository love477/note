interface IPlayDes {
  name: string;
  type: string;
}

interface IPlay {
  playName: IPlayDes;
}

interface IPerformance {
  playID: string;
  audience: number;

}

interface IInvoice {
  customer: string;
  premormances: IPerformance[];
}

const PLAY_TYPE = {
  TRAGEDY: 'tragedy',

  COMEDY: 'comedy'
};

function statement(invoice: IInvoice, plays: IPlay) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;

  const format = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2
  }).format;

  for (let perf of invoice.premormances) {
    const play: IPlayDes = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case PLAY_TYPE.TRAGEDY:
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case PLAY_TYPE.TRAGEDY:
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`unkonw play type: ${play.type}`);
    }

    volumeCredits += Math.max(perf.audience - 30, 0);
    if (play.type === PLAY_TYPE.TRAGEDY) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    result += ` ${play.name}: ${format(totalAmount / 100)}  ${perf.audience} seats\n`;
    totalAmount += thisAmount
  }

  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}