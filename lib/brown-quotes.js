'use babel';

import BrownQuotesView from './brown-quotes-view';
import { CompositeDisposable } from 'atom';

export default {

  brownQuotesView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.brownQuotesView = new BrownQuotesView(state.brownQuotesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.brownQuotesView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'brown-quotes:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.brownQuotesView.destroy();
  },

  serialize() {
    return {
      brownQuotesViewState: this.brownQuotesView.serialize()
    };
  },

  toggle() {
    console.log('BrownQuotes was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
