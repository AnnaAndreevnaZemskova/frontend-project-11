import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import resources from './ru.js';
import watch from './view.js';
import makeUrl from './helpers.js';
import parser from './parser.js';

export default () => {
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

  const i18n = i18next.createInstance();
  const defaultLanguage = 'ru';
  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const watchedState = watch(elements, i18n, state);
  watchedState.lng = 'ru';

  const getNewPosts = () => {
    const titlesOfPosts = watchedState.contents.posts.map(({ title }) => title);
    const arrayOfPromises = watchedState.loadedFeeds.map(([url, feedId]) => axios.get(makeUrl(url))
      .then((response) => {
        const { posts } = parser(response.data);
        const newPosts = posts.filter((post) => !titlesOfPosts.includes(post.title)).map((item) => {
          post.id = uniqueId();
          post.feedId = feed.id;
          return { ...item, feedId };
        });
        if (watchedState.loadedFeeds.length > 0) {
          watchedState.contents.posts = [...newPosts, ...watchedState.contents.posts];
        }
      }).catch((error) => {
        console.log('error: ', error);
      }));
    Promise.all(arrayOfPromises).finally(() => {
      setTimeout(() => getNewPosts(), 5000);
    });
  };

  getNewPosts();

  yup.setLocale({
    string: {
      url: () => ({ key: 'invalid' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
    },
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';
    const formData = new FormData(elements.form);
    const url = formData.get('url');
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

  elements.posts.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
      const { id } = e.target.dataset;
      watchedState.contents.posts.forEach((post) => {
        if (post.id === id) {
          watchedState.modal = {
            title: post.title,
            description: post.description,
            href: post.url,
            id: post.id,
          };
          watchedState.ui.seenPosts.push(post.id);
        }
      });
    }
  });
};
