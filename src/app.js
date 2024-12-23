import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view.js';
import resources from './ru.js';
import makeUrl from './helpers.js';
import parser from './parser.js';

export default () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      status: 'filling',
      valid: true,
      error: null,
      field: {
        website: '',
      },
      watchUrl: [],
    },
  };

  const schema = yup.object({
    website: yup.string().url().notOneOf(state.form.watchUrl),
  });
  const watchedState = watch(elements, i18next, state);
  const getFeedAndPosts = (url) => {
    axios.get(makeUrl(url))
      .then((response) => {
        const document = parser(response.data.contents);
        const feedText = document.querySelector('channel > title').textContent;
        const feedDescription = document.querySelector('channel > description').textContent;
        const feedId = uniqueId();
        const feed = {
          id: feedId,
          text: feedText,
          description: feedDescription,
        };
        const postsArr = Array.from(document.querySelectorAll('item'));
        const posts = postsArr.map((post) => {
          const postText = post.querySelector('title').textContent;
          const postDescription = post.querySelector('description').textContent;
          const postLink = post.querySelector('link').textContent;
          const postId = uniqueId();
          return {
            id: postId,
            text: postText,
            description: postDescription,
            link: postLink,
            feedId,
          };
        });
        watchedState.form.status = 'finished';
        watchedState.feed = feed;
        watchedState.posts = posts;
        console.log(watchedState);
      })
      .catch((err) => {
        watchedState.form.error = err.message;
        watchedState.form.status = 'failed';
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';
    const formData = new FormData(elements.form);
    const url = formData.get('url');
    watchedState.form.field.website = url;
    schema.validate(state.form.field)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.error = null;
        if (state.form.watchUrl.includes(url)) {
          watchedState.form.error = 'duplicate';
          watchedState.form.valid = false;
          watchedState.form.status = 'failed';
        } else {
          watchedState.form.watchUrl.push(url);
          getFeedAndPosts(url);
        }
      })
      .catch((err) => {
        watchedState.form.error = err.type;
        watchedState.form.valid = false;
        watchedState.form.status = 'failed';
      });
    watch(elements, i18next, watchedState);
  });
};
