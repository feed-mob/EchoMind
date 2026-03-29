import { positiveColor, neutralColor, negativeColor } from '../config/enum';

export const getDaysByKind = (obj:Record<string, 'positive' | 'neutral' | 'negative'>, kind:string) => {
  let result = 0;
  const list = Object.values(obj);
  list.forEach((v)=>{
    if (kind == v) {
      result += 1;
    }
  })
  return result;
}
const map = {
  'positive': positiveColor,
  'negative': negativeColor,
  'neutral': neutralColor,
}

export const getColorBySentiment = (k?: 'positive' | 'neutral' | 'negative') => {
  if (k && Object.keys(map).includes(k)) {
    return map[k]
  }
  return '#99a1af';
};