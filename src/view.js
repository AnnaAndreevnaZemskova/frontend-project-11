import onChange from 'on-change';
import { Modal } from 'bootstrap';

const renderFeedback = (elements, i18n, watchedState) => {
  elements.feedback.classList.add('text-danger');
  const { error } = watchedState.form;
  if (error) {
    elements.feedback.textContent = i18n.t(`feedbacks.errors.${error}`);
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
    case 'sending':
      elements.add.setAttribute('disabled', true);
      break;
    case 'failed':
      elements.add.removeAttribute('disabled');
      break;
    default:
      break;
  }
};
const renderFeeds = (elements, i18n, watchedState) => {
  elements.feeds.innerHTML = '';
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  elements.feeds.append(feedsCard);
  const feedsBody = document.createElement('div');
  feedsBody.classList.add('card-body');
  feedsCard.append(feedsBody);
  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = i18n.t('feeds');
  feedsBody.append(feedsTitle);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  feedsCard.append(ul);
  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    ul.append(li);
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.text;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
  });
};

const renderPosts = (elements, i18n, watchedState) => {
  elements.posts.innerHTML = '';
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  elements.posts.append(postsCard);
  const postsBody = document.createElement('div');
  postsBody.classList.add('card-body');
  postsCard.append(postsBody);
  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = i18n.t('posts');
  postsBody.append(postsTitle);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  postsCard.append(ul);

  watchedState.posts.forEach((post) => {
    const {
      id, text, link,
    } = post;
    const li = document.createElement('li');
    const button = document.createElement('button');
    const a = document.createElement('a');

    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    ul.prepend(li);

    a.href = link;
    a.textContent = text;
    a.target = '_blank';
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('data-post-id', id);
    if (watchedState.ulStateOpened.includes(id)) {
      a.classList.add('fw-normal');
    } else {
      a.classList.add('fw-bold');
    }

    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18n.t('button');
    button.setAttribute('data-post-id', id);
    li.append(a, button);
  });

  ul.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    const a = e.target.closest('a');

    if (button) {
      watchedState.ulStateOpened.push(button.dataset.postId);
      const [targetPost] = watchedState.posts.filter((post) => post.id === button.dataset.postId);
      const modal = new Modal(elements.modal);
      elements.modalTitle.textContent = targetPost.text;
      elements.modalBody.textContent = targetPost.description;
      elements.modalArticle.href = targetPost.link;
      modal.show();
    } else if (a) {
      watchedState.ulStateOpened.push(a.dataset.postId);
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
    }
  });
};

const render = (elements, i18n) => {
  elements.title.textContent = i18n.t('title');
  elements.subtitle.textContent = i18n.t('subtitle');
  elements.label.textContent = i18n.t('label');
  elements.example.textContent = i18n.t('example');
  elements.add.textContent = i18n.t('add');
  elements.fullArticle.textContent = i18n.t('modal.fullArticle');
  elements.buttonClose.textContent = i18n.t('modal.buttonClose');
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
    console.log(path);
    switch (path) {
      case 'lng':
        render(details, i18next);
        break;
      case 'form.status':
        renderStatus(details, watchedState);
        break;
      case 'form.error':
        renderFeedback(details, i18next, watchedState);
        break;
      case 'form.valid':
        renderValid(details, watchedState);
        break;
      case 'posts':
        renderPosts(details, i18next, watchedState);
        break;
      case 'ulStateOpened':
        renderPosts(details, i18next, watchedState);
        break;
      case 'feeds':
        renderFeeds(details, i18next, watchedState);
        renderFeedback(details, i18next, watchedState);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
