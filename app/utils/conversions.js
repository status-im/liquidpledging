import web3 from 'Embark/web3'
import BN from 'bn.js'
import numberToBN from 'number-to-bn'

export const toEther = amount => web3.utils.fromWei(amount, 'ether')

export const toWei = (amount, scale = 'ether') => web3.utils.toWei(amount, scale)

const padLeft = (number, length) => {
  let str = String(number)
  while (str.length < length) {
    str = '0' + str
  }
  return str
}

const padRight = (number, length) => {
  let str = String(number)
  while (str.length < length) {
    str += '0'
  }
  return str
}

export const fromTokenDecimals = (value, decimals = 18) => {
  value = numberToBN(value)
  const pow = new BN(10, 10).pow(numberToBN(decimals))
  const int = value.div(pow)
  const dec = padLeft(value.mod(pow).toString(10), decimals).replace(/0+$/, '')
  return int.toString(10) + (dec !== '' ? '.' + dec : '')
}

export const toTokenDecimals = (value, decimals = 18) => {
  value = value.toString().split('.')
  const pow = new BN(10, 10).pow(numberToBN(decimals))
  const int = numberToBN(value[0]).mul(pow)
  const dec = numberToBN(padRight(value.length > 1 ? value[1] : 0, decimals))
  if(dec.toString(10).length > pow.toString(10).length) throw new Error('Too many decimal places')
  return int.add(dec).toString(10)
}
