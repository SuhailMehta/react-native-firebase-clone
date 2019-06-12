/**
 * 
 * Invites representation wrapper
 */
import { Platform } from 'react-native';
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import Invitation from './Invitation';
export const MODULE_NAME = 'RNFirebaseInvites';
export const NAMESPACE = 'invites';
const NATIVE_EVENTS = ['invites_invitation_received'];
export default class Invites extends ModuleBase {
  constructor(app) {
    super(app, {
      events: NATIVE_EVENTS,
      hasCustomUrlSupport: false,
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      namespace: NAMESPACE
    });
    SharedEventEmitter.addListener( // sub to internal native event - this fans out to
    // public event name: onMessage
    'invites_invitation_received', invitation => {
      SharedEventEmitter.emit('onInvitation', invitation);
    }); // Tell the native module that we're ready to receive events

    if (Platform.OS === 'ios') {
      getNativeModule(this).jsInitialised();
    }
  }
  /**
   * Returns the invitation that triggered application open
   * @returns {Promise.<InvitationOpen>}
   */


  getInitialInvitation() {
    return getNativeModule(this).getInitialInvitation();
  }
  /**
   * Subscribe to invites
   * @param listener
   * @returns {Function}
   */


  onInvitation(listener) {
    getLogger(this).info('Creating onInvitation listener');
    SharedEventEmitter.addListener('onInvitation', listener);
    return () => {
      getLogger(this).info('Removing onInvitation listener');
      SharedEventEmitter.removeListener('onInvitation', listener);
    };
  }

  sendInvitation(invitation) {
    if (!(invitation instanceof Invitation)) {
      return Promise.reject(new Error(`Invites:sendInvitation expects an 'Invitation' but got type ${typeof invitation}`));
    }

    try {
      return getNativeModule(this).sendInvitation(invitation.build());
    } catch (error) {
      return Promise.reject(error);
    }
  }

}
export const statics = {
  Invitation
};