import * as yup from 'yup';
import i18next from 'i18next';
import watch from './view.js';
import resources from './ru.js';

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
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';
    const formData = new FormData(elements.form);
    const url = formData.get('url');
    watchedState.form.field.website = url;
    schema.validate(state.form.field)
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.status = 'finished';
        watchedState.form.error = null;
        if (state.form.watchUrl.includes(url)) {
          watchedState.form.error = ['duplicate'];
          watchedState.form.valid = false;
        } else {
          watchedState.form.watchUrl.push(url);
        }
      })
      .catch((err) => {
        watchedState.form.error = err.type;
        watchedState.form.valid = false;
      });
    watch(elements, i18next, watchedState);
  });
};
