// index.js (Press Module Barrel File)
import PressStudio from './PressStudio';
import RemoteView from './RemoteView';
import PressPreview from './PressPreview';
import PressRemote from './PressRemote';
import PressUploader from './PressUploader';
import PressThumbnails from './PressThumbnails';
import PressEditModal from './PressEditModal';
import OasisButton from './OasisButton';
import OasisIconButton from './OasisIconButton';
import SlideCanvasView from './SlideCanvasView';

export {
  PressStudio,
  PressPreview,
  PressRemote,
  PressUploader,
  PressThumbnails,
  PressEditModal,
  PressEditModal as PressModal, // alias: el creador y el editor ahora son el mismo componente
  RemoteView,
  OasisButton,
  OasisIconButton,
  SlideCanvasView,
  // Legacy aliases
  PressStudio as PowerPointRemoteModule,
  RemoteView as PowerPointRemoteView,
};

export * from './presentations';

export default PressStudio;
