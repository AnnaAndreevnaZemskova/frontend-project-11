import onChange from 'on-change';

// export default (elements, i18n, state) => {
//   const renderValid = (elements, value) => {
//   value ? elements.input.classList.remove('is-invalid') :
// elements.input.classList.add('is-invalid');
//   };
// };
//   const renderFeedback = (elements, i18n, state) => {
//     elements.feedback.classList.add('text-danger');
//     switch (state.form.error) {
//       case 'url':
//         elements.feedback.textContent = i18n.t('feedbacks.errors.invalid');
//         break;
//       case 'duplicate':
//         elements.feedback.textContent = i18n.t('feedbacks.errors.duplicate');
//         break;
//       case 'invalidRss':
//         elements.feedback.textContent = i18n.t('feedbacks.errors.invalidRss');
//         break;
//       default:
//         elements.feedback.textContent = i18n.t('feedbacks.valid');
//         elements.feedback.style.color = 'green';
//         elements.feedback.classList.remove('text-danger');
//         break;
//     }
//   };
// };

const renderStatus = (elements, current) => {
  switch (current) {
    case 'finished':
      elements.input.value = '';
      elements.input.focus();
      break;
    default:
  }
};

const watchedState = onChange(state, (path, current) => {
  switch (path) {
    case 'form.status':
      renderStatus(elements, current);
      break;
    case 'form.error':
      renderFeedback(elements, i18n, watchedState);
      console.log(path);
      console.log(state.form.error);
      break;
    case 'form.valid':
      renderValid(elements, current);
      break;
    case 'form.field.website':
      break;
    case 'form.watchUrl':
      break;
    default:
      break;
  }
  return watchedState;
});
