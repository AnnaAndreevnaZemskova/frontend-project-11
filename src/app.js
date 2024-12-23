import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view.js';
import resources from './languages/ru.js';
import makeUrl from './helpers.js';
import parser from './parser.js';

const elements = {
  title: document.querySelector('h1'),
  subtitle: document.querySelector('.lead'),
  label: document.querySelector('[for="url-input"]'),
  add: document.querySelector('[type="submit"]'),
  example: document.querySelector('.example'),
  fullArticle: document.querySelector('.full-article'),
  buttonClose: document.querySelector('.btn-secondary'),
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: document.querySelector('#modal'),
  modalTitle: document.querySelector('.modal-title'),
  modalBody: document.querySelector('.modal-body'),
  modalArticle: document.querySelector('.full-article'),
};

const state = {
  form: {
    status: 'filling',
    valid: true,
    error: null,
    watchUrl: [],
  },
  feeds: [],
  posts: [],
  ulStateOpened: [],
};

export default () => {
  const defaultLanguage = 'ru';
  i18next.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = watch(elements, i18next, state);
      watchedState.lng = 'ru';

      const getNewPosts = (feeds) => {
        feeds.forEach((feed) => {
          axios.get(feed.url)
            .then((response) => {
              const [, posts] = parser(response.data.contents);
              const filterPost = (post) => post.timeOfPost > feed.lastUpdate;
              const newPosts = posts.filter(filterPost);

              newPosts.map((post) => {
                post.id = uniqueId();
                post.feedId = feed.id;
                watchedState.posts.push(post);
                feed.lastUpdate = post.timeOfPost;
                return post;
              });
              watchedState.form.status = 'finished';
              setTimeout(() => getNewPosts(watchedState.feeds), 5000);
            })
            .catch((err) => {
              watchedState.form.status = 'failed';
              watchedState.form.valid = false;
              watchedState.form.error = (axios.isAxiosError(err)) ? 'networkError' : err.message;
            });
        });
      };

      const getFeedAndPosts = (url) => {
        axios.get(makeUrl(url))
          .then((response) => {
            const [feed, posts] = parser(response.data.contents);
            feed.url = makeUrl(url);
            feed.lastUpdate = posts[posts.length - 1].timeOfPost;
            feed.id = uniqueId();
            posts.forEach((post) => {
              post.id = uniqueId();
              post.feedId = feed.id;
            });
            watchedState.form.status = 'finished';
            watchedState.feeds.push(feed);
            watchedState.posts = posts;
            getNewPosts(watchedState.feeds);
          })
          .catch((err) => {
            watchedState.form.error = (err.isAxiosError) ? 'networkError' : err.message;
            watchedState.form.valid = false;
            watchedState.form.status = 'failed';
          });
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.status = 'sending';
        const formData = new FormData(elements.form);
        const url = formData.get('url');
        yup.setLocale({
          string: {
            url: () => ({ key: 'invalid' }),
          },
          mixed: {
            notOneOf: () => ({ key: 'notOneOf' }),
          },
        });
        const schema = yup.object({
          website: yup.string().url().notOneOf(watchedState.form.watchUrl),
        });
        schema.validate({ website: url })
          .then(() => {
            watchedState.form.valid = true;
            watchedState.form.error = null;
            getFeedAndPosts(url);
            watchedState.form.watchUrl.push(url);
          })
          .catch((err) => {
            watchedState.form.error = err.message.key;
            watchedState.form.valid = false;
            watchedState.form.status = 'failed';
          });
        watch(elements, i18next, watchedState);
      });
    });
};
