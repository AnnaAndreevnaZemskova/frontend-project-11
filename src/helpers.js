export default (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app/get?');
  newUrl.searchParams.set('disableCache', 'true');
  newUrl.searchParams.set('url', url);
  return newUrl.toString();
};
