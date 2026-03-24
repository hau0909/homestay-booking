// Remove Vietnamese diacritics from a string
export function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
