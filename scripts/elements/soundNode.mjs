import {
  getPlayingPlaylists,
  renderTemplateWrapper,
} from "../foundryWrapper.mjs";
import { TEMPLATE_IDS, getTemplatePath } from "../templates.mjs";
import { makeObservable, stopSound } from "../utils.mjs";

/**
 * Update ProgressBar-Element "width" by calculating the Sound progress.
 * @param {jQuery} element Element which holds data-attributes (currentTime, duration) and will be updated
 * @param {*} update FoundryVTT object update
 * @returns {void}
 */
export function updateProgressBar(element, update) {
  const state = element.data();
  const { prop, returnVal } = update;

  const shouldIgnoreUpdate =
    !["currentTime", "duration"].includes(prop) || !returnVal;
  if (shouldIgnoreUpdate) return;
  state[prop] = returnVal;

  const { currentTime, duration } = state;
  if (!currentTime || !duration) return; // only update if both are set

  const calculatedProgress = Math.min((currentTime / duration) * 100, 100);
  element.css("width", `${calculatedProgress}%`);
}

function registerHooks(progressElement, soundId) {
  const state = progressElement.data();

  // getSound
  const getHookId = Hooks.on(`getSound-${soundId}`, (update) => {
    updateProgressBar(progressElement, update);
  });
  state["getHookId"] = getHookId;

  // setSound
  // const setHookId = Hooks.on(`setSound-${soundId}`, (update) =>
  //   logToConsole(update)
  // );
  // state["setHookId"] = setHookId;
}

/**
 * Adds SoundNode as child to element.
 * @param {jQuery} element to add new SoundbardSoundNode to
 * @param {string} playlistId PlaylistID of sound
 * @param {string} soundId ID of sound to add
 * @returns {Promise<void>}
 */
export async function addSoundNode(element, sound) {
  if (!element?.length) return;
  const soundId = sound.id;

  // create template
  const soundNodeTemplate = await renderTemplateWrapper(
    getTemplatePath(TEMPLATE_IDS.SOUNDBOARD_SOUND_NODE),
    { label: sound.name, id: soundId }
  );
  element.append(soundNodeTemplate);

  // add "click"-handler
  const container = element.find(`#${soundId}-sound-node`);
  if (!container?.length) return;
  container.on("click", async () => {
    await stopSound(getPlayingPlaylists(), soundId);
  });

  // register custom Hooks (emitted by observable)
  const progressElement = container.find(`#${soundId}-sound-node-progress`);
  registerHooks(progressElement, soundId);

  // replace sound-obj with Proxy
  sound.sound = makeObservable(
    sound.sound,
    `getSound-${soundId}`,
    `setSound-${soundId}`,
    false
  );
}

/**
 * Removes rendered SoundNode from element.
 * @param {jQuery} element parent of SoundbardSoundNode to remove
 * @param {string} soundId ID of Sound-obj of rendered SoundbardSoundNode to remove
 * @returns {void}
 */
export function removeSoundNode(element, soundId) {
  if (!element?.length) return;

  const soundNode = element.find(`#${soundId}-sound-node`);
  if (!soundNode?.length) return;

  const soundProgress = soundNode.find(`#${soundId}-sound-node-progress`);
  const { getHookId } = soundProgress.data();
  Hooks.off(`getSound-${soundId}`, getHookId);
  // Hooks.off(`setSound-${soundId}`, setHookId);
  soundNode.remove();
}
