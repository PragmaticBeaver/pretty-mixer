import { renderTemplateWrapper } from "../foundryWrapper.mjs";
import { logToConsole } from "../log.mjs";
import { TEMPLATE_IDS, getTemplatePath } from "../templates.mjs";

export async function addPlaylistCard(element, name, id) {
  if (!element?.length) return;

  // create template
  const tempalte = await renderTemplateWrapper(
    getTemplatePath(TEMPLATE_IDS.PLAYLIST_CARD),
    { title: name, id }
  );
  element.append(tempalte);

  // add "click"-handler
  const card = element.find(`#${id}-playlist-card`);
  if (!card?.length) return;
  card.on("click", () => {
    // todo - open playlist info
    logToConsole(`PlaylistCard ${id} clicked`);
  });
}

export function removePlaylistCard(element, id) {
  if (!element?.length) return;

  const card = element.find(`#${id}-playlist-card`);
  if (!card?.length) return;
  card.remove();
}

export function updatePlaylistCardTitle(element, id, title) {
  const titleElement = element
    .find(`#${id}-playlist-card`)
    .find(".playlist-card-title");
  if (!titleElement?.length) return;
  titleElement.html(title);
}

export function updatePlaylistCardButton(element, id, isPlaying) {
  const buttonElement = element
    .find(`#${id}-playlist-card`)
    .find(".playlist-card-button");
  if (!buttonElement?.length) return;

  const playIcon = buttonElement.find(".fa-play");
  const pauseIcon = buttonElement.find(".fa-pause");
  logToConsole({ buttonElement, playIcon, pauseIcon });

  const inactiveClass = "playlist-card-button-icon-inactive";
  playIcon.removeClass(inactiveClass);
  pauseIcon.removeClass(inactiveClass);

  isPlaying
    ? playIcon.addClass(inactiveClass)
    : pauseIcon.addClass(inactiveClass);
}
