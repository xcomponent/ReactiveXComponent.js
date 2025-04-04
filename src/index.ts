import { forceCompile } from './utils/forceCompile';

import { StateMachineInstance } from './interfaces/StateMachineInstance';
import { StateMachineRef } from './interfaces/StateMachineRef';
import { JsonMessage, CompositionModel } from './communication/xcomponentMessages';
import { XComponent } from './XComponent';
import { Session } from './interfaces/Session';
import { Connection } from './interfaces/Connection';
import { ErrorListener } from './interfaces/ErrorListener';
import { StateMachineUpdateListener } from './interfaces/StateMachineUpdateListener';

// ✅ Exportation publique
export { CompositionModel, JsonMessage } from './communication/xcomponentMessages';
export { StateMachineUpdateListener } from './interfaces/StateMachineUpdateListener';
export { StateMachineInstance } from './interfaces/StateMachineInstance';
export { StateMachineRef } from './interfaces/StateMachineRef';
export { ErrorListener } from './interfaces/ErrorListener';
export { Connection } from './interfaces/Connection';
export { Session } from './interfaces/Session';
export { XComponent } from './XComponent';

// ✅ Forcer l'inclusion sans violer TSLint
forceCompile(new StateMachineInstance({} as StateMachineRef, {} as JsonMessage));
forceCompile(new XComponent());
forceCompile({} as Session);
forceCompile({} as Connection);
forceCompile({} as ErrorListener);
forceCompile({} as StateMachineUpdateListener);
forceCompile({} as CompositionModel);

// ✅ Export par défaut
export default new XComponent();
