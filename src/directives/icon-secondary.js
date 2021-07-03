export default {
  beforeMount(el, binding) {
    let iconClass = `fa fa-${binding.value.icon} text-2xl`;

    if (binding.value.right) {
      iconClass += ' float-right';
    }

    if (binding.value.white) {
      iconClass += ' text-white';
    } else {
      iconClass += ' text-green-400';
    }

    // eslint-disable-next-line no-param-reassign
    el.innerHTML += `<i class="${iconClass}"></i>`;
  },
};
