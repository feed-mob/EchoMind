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



/**
 * 包装一个异步操作，确保总耗时至少为 minDuration 毫秒
 * @param {Promise<T>|(() => Promise<T>)} task - 异步操作（可以是 Promise 对象或返回 Promise 的函数）
 * @param {number} minDuration - 最小耗时（毫秒），默认 3000
 * @returns {Promise<T>} 返回原始操作的结果
 */
export async function withMinDuration<T>(task: Promise<T>|(() => Promise<T>), minDuration = 3000):Promise<T> {
  const start = Date.now();

  // 统一处理 task 为 Promise
  const promise = typeof task === 'function' ? task() : task;

  try {
    const result = await promise;
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDuration - elapsed);
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    return result;
  } catch (error) {
    // 即使出错也要确保等待满 minDuration
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDuration - elapsed);
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    throw error;
  }
}