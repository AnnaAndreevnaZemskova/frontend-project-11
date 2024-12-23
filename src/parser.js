export default (flow) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(flow, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const error = new Error('invalidRss');
    throw error;
  } else {
    return doc;
  }
};
