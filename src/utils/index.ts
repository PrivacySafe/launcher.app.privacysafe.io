export function userNameFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@');
  return indOfAt <= 0 ? '' : userId.substring(0, indOfAt);
}

export function userDomainFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@');
  return indOfAt <= 0 ? userId : userId.substring(indOfAt);
}
