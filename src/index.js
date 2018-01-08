
const WebSocket = require('ws')
const queryString = require('query-string')
const moment = require('moment')
const Redis = require('redis')
const Promise = require('bluebird')

const { LIST_COUNT, BUYING_PERCENT, SELLING_PERCENT } = require('./config')

Promise.promisifyAll(Redis.RedisClient.prototype);
Promise.promisifyAll(Redis.Multi.prototype);

let redis = undefined

const option = {
  host: 'wss://www.cryptopia.co.nz/signalr/connect',
  query: {
    transport: 'webSockets',
    clientProtocol: '1.5',
    connectionToken: '+/L2rGCmxN6Rq9dbMZKyOXDmLK0Sj+6DGnP9iEub263seTUya2fzWWl+pdVTQQcvm3D4EiybB0+b7VU05Jpl+BSWAxlrivHQk4jKtwljui6plFUbnVKbV6+udpAsBK1T',
    connectionData: '[{"name":"notificationhub"}]',
    tid:'3',
  }
}

console.log('start')

const ws = new WebSocket(`${option.host}?${queryString.stringify(option.query)}`, {
  headers: {
    'Accept-Encoding':'gzip, deflate, br',
    'Accept-Language':'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.6',
    'Cache-Control':'no-cache',
    'Connection':'Upgrade',
    'Cookie':'visid_incap_1244263=a7PZl7IIQWWEilt3V2w1uJ7PUFoAAAAAQUIPAAAAAAAuLqQGU77y56qGb+NyUgID; __auc=1f2e00a8160cbab0a2c500bd7a4; __RequestVerificationToken=jkLh4bKIX56CayGVbGAaqTnoyFJFZ5SPm8nJ4rQQkb3nZBTLcrij-NOOrmlT9w4pvuso6dR3gpR1x3ekuPr9sqV6-ZSlbBaedN42i7rU5XE1; nlbi_1244263=JeQ/SkELjhGlFI71KSS2gAAAAAD8b2xEXmoUjabUPlphriJW; incap_ses_947_1244263=SXlEeZruiU6beHIujmskDTNAU1oAAAAAscvACR8BYL4eYvl63U+JFg==; __asc=ab11a526160d532ccc979731c78; incap_ses_951_1244263=e461OIaVbgOlhwIahKEyDYBAU1oAAAAAHU2Xjo+9iEZyEKH3yPRZog==; Cryptopia=CtUwJVqtzoPFZXu3JVhUKscBNhnZUF2gjviq9NojPpGvxRCBPUF15oMOYmRXXc4kWXf8rgN1LaCj_c8Wy6a61_mx1plLRWNAy2FvFaemIjFRyCziHvQgWinNRBd_X8yZiRdegPBF--7DkJndbUo38IMEEf5Ll7QjlHvnei-69t081uvsuCNqAr72tcTgP4LEFFp1zBHxjbtVsP8N1cbCtwHfheRsb_N5r2SzoZFkh02x3t4eV4a8QKWNIpCkBKdMQ3RFFzLLoVpT9dO4Opu3J4VDaq4nR56o7Q-onUvZzYI588dxZZ6Ayo7Ysn_ufOYKouT1rzb_SGwnIxsJrftBaC4JxUVvgOKQfEG7BIPkPtDNtvJ2jSw1Iu5aVM1EJkuiDYROqeXPXUbfiqkGjE6zazugYBQ59BpvExDt-Qj8BUyqlAcezp1WIPhjkqCz3BlhTdhGhBMdqEwRHi9x0S6UA3bcwys7vabmk5db8YhMxd-zmUJjX7VxoALGfw1C3JFFU0K8KMdHmqlec56Sp9n2DqJ1-IIeQNTCt_dAffX0cgBbUMv4VWF-7tnvAJsnptXmXuFAD5T28h40s9EUuECIdHVzVm6_nDujvDRKs6Mw-_A0mS10rQ1ZQISx0ESJ-4tq',
    'Upgrade':'websocket',
  }
})

ws.on('open', () =>{
  redis = Redis.createClient({
    host: '127.0.0.1',
    port: 63799,
  })
  redis.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
  });
})

ws.on('message', function (msg) {
  const data = JSON.parse(msg)
  if (data.M) {
    data.M.filter((trades) => {
      trades.A.filter(async (v) => {
        if(v.DataType === 3){

          const minutes = moment().format('YYYY-MM-DD_HH:mm')
          console.log(`마켓 이름 : ${v.Market} 현재 시각: ${moment().format('YYYY-MM-DD_HH:mm:ss.SSS')} / 수익률: ${v.Change}% / 현재가격:  ${v.Last.toFixed(8)} BTC`)

          let tradeInfo = await redis.getAsync(`${v.TradePairId}_${v.Market}`) || '{}'
          tradeInfo = JSON.parse(tradeInfo)
          Object.keys(tradeInfo).filter((v, i) => {
            if(i >= LIST_COUNT){
              delete tradeInfo[v]
            }
          })

          if(tradeInfo[minutes]){
            if(tradeInfo[minutes].High < v.Change){
              tradeInfo[minutes] =  { High: v.Change, Low: tradeInfo[minutes].Low }
              redis.set(`${v.TradePairId}_${v.Market}`, JSON.stringify(tradeInfo))

            }else if(tradeInfo[minutes].Low > v.Change){
              tradeInfo[minutes] =  { High: tradeInfo[minutes].High, Low: v.Change }
              redis.set(`${v.TradePairId}_${v.Market}`, JSON.stringify(tradeInfo))

            }
          } else {
            tradeInfo[minutes] =  { High: v.Change, Low: v.Change }
            redis.set(`${v.TradePairId}_${v.Market}`, JSON.stringify(tradeInfo))
          }
        }
        return false
      })
      return false
    })
  }
});



// 구매
/*
{
  DataType: 1 
  Amount: 500000,
  Rate: 1e-8,
  Timestamp: '2018-01-08T11:37:00.5068751Z',
  Total: 0.005,
  TradePairId: 1721,
  Type: 0,
  UserId: null,
}

{
  DataType: 0 
  Action: 3,
  Amount: 800000,
  Rate: 1e-8,
  Total: 0.008,
  TradePairId: 1721,
  Type: 1,
  UserId: null,
}
{ TradePairId: 1721,
  Market: 'PAC_BTC',
  Change: 0,
  Last: 1e-8,
  High: 2e-8,
  Low: 1e-8,
  Volume: 122274811042.52019,
  BaseVolume: 1394.9593328859085,
  UserId: null,
  DataType: 3
}
*/
