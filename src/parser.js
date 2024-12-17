export default (flow) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(flow, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const error = new Error('invalidRss');
    throw error;
  } else {
    const postsArr = Array.from(doc.querySelectorAll('item'));
    const feed = {
      text: doc.querySelector('channel > title').textContent,
      description: doc.querySelector('channel > description').textContent,
    };
    const posts = postsArr.reverse().map((post) => {
      const title = post.querySelector('title');
      return {
        text: title.textContent,
        description: post.querySelector('description').textContent,
        link: post.querySelector('link').textContent,
        timeOfPost: post.querySelector('pubDate').textContent,
      };
    });
    return [feed, posts];
  }
};
