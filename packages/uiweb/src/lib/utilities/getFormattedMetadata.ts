import { FrameDetails } from '../types';

export function getFormattedMetadata(URL: string, data: any) {
  const frameDetails: FrameDetails = {
    image: '',
    siteURL: URL,
    postURL: '',
    buttons: [],
    input: { name: '', content: '' },
    state: '',
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');

  const metaElements: NodeListOf<HTMLMetaElement> =
    doc.head.querySelectorAll('meta');

  metaElements.forEach((element, index) => {
    const name =
      element.getAttribute('name') || element.getAttribute('property');
    const content = element.getAttribute('content');

    if (name && content) {
      if (name === 'fc:frame:image' || name === 'of:image') {
        frameDetails.image = content;
      } else if (name === 'fc:frame:post_url' || name === 'of:post_url') {
        frameDetails.postURL = content;
      } else if (name === 'fc:frame:state' || name === 'of:state') {
        frameDetails.state = content;
      } else if (
        (name.includes('fc:frame:button') || name.includes('of:button')) &&
        !name.includes('action') &&
        !name.includes('target')
      ) {
        const index = name.split(':')[3];
        const indexZeroExists = frameDetails.buttons.some(
          (button: any) => button.index === index
        );
        if (!indexZeroExists) {
          frameDetails.buttons.push({
            index: index,
            content: content,
            action: '',
            target: '',
          });
        } else {
          const indexToUpdate = frameDetails.buttons.findIndex(
            (button: any) => button.index === String(index)
          );
          frameDetails.buttons[indexToUpdate].content = content;
          frameDetails.buttons[indexToUpdate].index = index;
        }
      } else if (name === 'fc:frame:input:text' || name === 'of:input:text') {
        frameDetails.input = { name, content };
      } else if (
        (name.includes('fc:frame:button') || name.includes('of:button')) &&
        name.includes(':action')
      ) {
        const number = name.split(':')[3];
        const indexZeroExists = frameDetails.buttons.some(
          (button: any) => button.index === number
        );
        if (!indexZeroExists) {
          frameDetails.buttons.push({
            index: number,
            content: '',
            action: content,
            target: '',
          });
        } else {
          const indexToUpdate = frameDetails.buttons.findIndex(
            (button: any) => button.index === number
          );
          frameDetails.buttons[indexToUpdate].action = content;
        }
      } else if (
        (name.includes('fc:frame:button') || name.includes('of:button')) &&
        name.includes(':target')
      ) {
        const number = name.split(':')[3];

        const indexZeroExists = frameDetails.buttons.some(
          (button: any) => button.index === number
        );

        if (!indexZeroExists) {
          frameDetails.buttons.push({
            index: number,
            content: '',
            action: '',
            target: content,
          });
        } else {
          const indexToUpdate = frameDetails.buttons.findIndex(
            (button: any) => button.index === number
          );

          frameDetails.buttons[indexToUpdate].target = content;
        }
      }
    }
  });

  return frameDetails;
}
