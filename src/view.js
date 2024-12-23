import onChange from 'on-change';

const renderFeedback = (elements, i18n, state) => {
  if (state.form.error) {
    elements.feedback.textContent = (state.form.error.includes('url')) ? i18n.t('feedbacks.errors.invalid') : i18n.t('feedbacks.errors.duplicate');
    elements.feedback.classList.add('text-danger');
  } else {
    elements.feedback.textContent = i18n.t('feedbacks.valid');
    elements.feedback.style.color = 'green';
    elements.feedback.classList.remove('text-danger');
  }
};

const renderStatus = (elements, watchedState) => {
  switch (watchedState.form.status) {
    case 'finished':
      elements.input.value = '';
      elements.input.focus();
      elements.add.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

export default (details, i18next, state) => {
  const renderValid = (elements, watchedState) => {
    if (watchedState.form.valid) {
      elements.input.classList.remove('is-invalid');
    } else {
      elements.input.classList.add('is-invalid');
    }
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status':
        renderStatus(details, watchedState);
        break;
      case 'form.error':
        renderFeedback(details, i18next, watchedState);
        console.log(path);
        console.log(state.form.error);
        break;
      case 'form.valid':
        renderValid(details, watchedState);
        break;
      case 'form.field.website':
        break;
      case 'form.watchUrl':
        break;
      default:
        break;
    }
  });
  return watchedState;
};
