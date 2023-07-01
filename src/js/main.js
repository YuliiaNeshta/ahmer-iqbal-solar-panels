import "../scss/style.scss";

AOS.init();

class Dropdowns {
  constructor({
    // groupSelector,
    dropdownSelector,
    toggleSelector,
    contentSelector,
    activeClass = "js--active",
    eventType = "click",
    initialDropdowns = [],
    isMultiple = false,
    toggleTexts,
    // closeOnFocusOut = false,
  }) {
    // this.group = document.querySelectorAll(groupSelector);
    this.dropdowns = [];
    this.dropdownsElements = document.querySelectorAll(dropdownSelector);
    this.toggleSelector = toggleSelector;
    this.contentSelector = contentSelector;
    this.activeClass = activeClass;
    this.eventType = eventType;
    this.openedDropdowns = new Set(initialDropdowns);
    this.isMultiple = isMultiple;
    this.toggleTexts = toggleTexts;
    // this.closeOnFocusOut = closeOnFocusOut;

    this.timeoutsToResetHeights = new Map([]);
  }

  init() {
    for (let i = 0; i < this.dropdownsElements.length; i += 1) {
      const dropdown = this.dropdownsElements[i];
      const toggle = dropdown.querySelector(this.toggleSelector) ?? dropdown;
      const content = dropdown.querySelector(this.contentSelector);

      if (!content) {
        if (toggle !== dropdown) {
          toggle.remove();
        }
      } else {
        this.dropdowns.push({
          index: i,
          dropdownElement: dropdown,
          toggleElement: toggle,
          contentElement: content,
          contentInnerElement: content.firstElementChild,
        });

        toggle.addEventListener(this.eventType, () => {
          this.toggle(i);
        });
      }
    }

    this.closeMultiple(
      this.dropdowns
        .map((d) => d.index)
        .filter((d) => !this.openedDropdowns.has(d))
    );
    // setTimeout(() => {
    // });
    this.openMultiple(this.openedDropdowns);
  }

  toggle(i) {
    if (this.openedDropdowns.has(i)) {
      return this.close(i);
    }
    return this.open(i);
  }

  open(i) {
    const dropdown = this.dropdowns[i];
    const {
      dropdownElement,
      contentElement,
      contentInnerElement,
      toggleElement,
    } = dropdown;
    const heightToSet = contentInnerElement.clientHeight;
    const duration =
      parseFloat(getComputedStyle(contentElement).transitionDuration) * 1000;

    if (!this.isMultiple) {
      this.openedDropdowns.forEach((dropdownIndex) => {
        if (i !== dropdownIndex) {
          this.close(dropdownIndex);
        }
      });
    }

    if (this.toggleTexts) {
      toggleElement.textContent = this.toggleTexts.open;
    }

    const timeoutId = setTimeout(() => {
      contentElement.style.height = "auto";
      this.deleteTimeout(i);
    }, duration);
    this.timeoutsToResetHeights.set(i, timeoutId);

    contentElement.style.height = `${heightToSet}px`;
    dropdownElement.classList.add(this.activeClass);
    this.openedDropdowns.add(i);

    return dropdown;
  }

  close(i) {
    const dropdown = this.dropdowns[i];
    const {
      dropdownElement,
      contentElement,
      contentInnerElement,
      toggleElement,
    } = dropdown;
    const heightToStartWith = contentInnerElement.clientHeight;

    this.deleteTimeout(i);

    if (this.toggleTexts) {
      toggleElement.textContent = this.toggleTexts.close;
    }

    contentElement.style.height = `${heightToStartWith}px`;
    setTimeout(() => {
      contentElement.style.height = "0px";
    }, 0);

    dropdownElement.classList.remove(this.activeClass);
    this.openedDropdowns.delete(i);

    return dropdown;
  }

  openMultiple(indexes) {
    indexes.forEach((index) => {
      this.open(index);
    });
  }

  closeMultiple(indexes) {
    indexes.forEach((index) => {
      this.close(index);
    });
  }

  deleteTimeout(i) {
    const timeoutId = Number(this.timeoutsToResetHeights.get(i));
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutsToResetHeights.delete(i);
    }
  }
}

export default Dropdowns;

const faqMainPageDropdowns = new Dropdowns({
  dropdownSelector: ".faq__item",
  contentSelector: ".faq__content",
});

faqMainPageDropdowns.init();

document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector(".header");
  let scrollPosition;

  function handleScroll() {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    menu.classList.toggle("fixed-header", scrollPosition >= 500);
  }

  window.addEventListener("scroll", handleScroll);
});
