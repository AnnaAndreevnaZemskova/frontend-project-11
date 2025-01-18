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
    const arrayOfPromises = watchedState.loadedFeeds.map((url) => axios.get(makeUrl(url))
      .then((response) => {
        const { posts } = parser(response.data);
        const newPosts = posts.filter((post) => !titlesOfPosts.includes(post.title)).map((item) => {
          const id = uniqueId();
          return { ...item, id };
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

    const formData = new FormData(e.target);
    const newRss = Object.fromEntries(formData);

    const schema = yup.object().shape({
      url: yup.string().required().url().notOneOf(watchedState.loadedFeeds),
    });

    schema
      .validate(newRss, { abortEarly: false })
      .then((data) => {
        watchedState.status = 'loading';

        axios
          .get(makeUrl(data.url), { timeout: 5000 })
          .then((response) => {
            if (response.status === 200) {
              const { feed, posts } = parser(response.data);
              watchedState.contents.feeds.unshift(feed);
              watchedState.contents.posts.unshift(...posts);
              watchedState.loadedFeeds.push(data.url);
              watchedState.status = 'filling';
            } else {
              throw new Error('errors.urlIsNotRSS');
            }
          })
          .catch((error) => {
            const { message } = error;
            watchedState.form.errors = message === 'timeout of 5000ms exceeded' ? 'errors.timeout' : message;
            watchedState.status = 'filling';
          });
      })
      .catch((err) => {
        const { message } = err;
        watchedState.form.errors = message;
        watchedState.status = 'filling';
      });
    console.log('watchedState: ', watchedState);
  });

  elements.posts.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
      const { id } = e.target.dataset;
      state.contents.posts.forEach((post) => {
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
