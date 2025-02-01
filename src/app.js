/* eslint-disable no-param-reassign */

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

  yup.setLocale({
    string: {
      url: () => ({ key: 'invalid' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
    },
  });

  const defaultLanguage = 'ru';
  i18next.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = watch(elements, i18next, state);
      watchedState.lng = 'ru'

      const fetchAndProcessPosts = () => {
        const promises = watchedState.feeds.map((feed) => {
          feed.url = makeUrl(url);
          return axios.get(feed.url)
            .then((response) => {
              const [, posts] = parser(response.data.contents);
              const newPosts = posts.filter((post) => post.timeOfPost > feed.lastUpdate);
              return newPosts.map((post) => ({
                ...post,
                id: uniqueId(),
                feedId: feed.id,
              }));
            })
            .catch((err) => {
              watchedState.form.status = 'failed';
              watchedState.form.valid = false;
              watchedState.form.error = (axios.isAxiosError(err)) ? 'networkError' : err.message;
            });
        });
    
        Promise.all(promises)
            .then((results) => {
                const allNewPosts = results.flat();
                watchedState.posts.push(...allNewPosts);
                allNewPosts.forEach((post) => {
                    const feed = watchedState.feeds.find(f => f.id === post.feedId);
                    if (feed) {
                        feed.lastUpdate = post.timeOfPost;
                    }
                });
              watchedState.form.status = 'finished';
                return allNewPosts.length;
            })
            .catch((err) => {
              watchedState.form.status = 'failed';
              watchedState.form.valid = false;
              watchedState.form.error = (axios.isAxiosError(err)) ? 'networkError' : err.message;
            })
          .finally(() => {
              setTimeout(fetchAndProcessPosts, 5000);
          });
      };
      fetchAndProcessPosts();
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
    };
