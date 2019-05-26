'use babel';

import BrownQuotesView from './brown-quotes-view';
import { CompositeDisposable } from 'atom';
import cheerio from 'cheerio';
import request from 'request';

var quotes = []

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

    // Register command that fetchs this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'brown-quotes:fetch': () => this.fetch()
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

  download(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Unable to download page'
          })
        }
      })
    })
  },

  scrape(html) {
    $ = cheerio.load(html)
    links = $('blockquote.td_pull_quote');
      $(links).each(function(i, link){
        var quote = $(this).text();
        quotes[i] = quote;
      });
  },

  fetch() {
    let editor
    let self = this

    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = 'https://www.goalcast.com/2018/02/22/12-charlie-brown-quotes/'
      this.download(selection).then((html) => {
        self.scrape(html)
        let l = quotes.length
        if (l === 0) {
          atom.notifications.addWarning('No quotes found :(')
        } else {
          let pos = Math.floor(Math.random() * l)
          editor.insertText("// ")
          editor.insertText(quotes[pos])
          atom.notifications.addSuccess('Quote added')
        }
      }).catch((error) => {
        console.log(error)
        atom.notifications.addWarning(error.reason)
      })
    }
  }

};
