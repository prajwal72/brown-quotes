'use babel';

import BrownQuotesView from './brown-quotes-view';
import { CompositeDisposable } from 'atom';
import cheerio from 'cheerio';
import request from 'request';
const fs = require("fs");

var quotes = ['Stop worrying about the world ending today. It’s already tomorrow in Australia.',
  'All you need is love. But a little chocolate now and then doesn’t hurt.',
  'Be yourself. No one can say you’re doing it wrong.',
  'Learn from yesterday, live for today, look to tomorrow, rest this afternoon.',
  'There’s no sense in doing a lot of barking if you don’t really have anything to say.',
  'If no one answers the phone, dial louder.',
  'I don’t have time to worry about who doesn’t like me … I’m too busy loving the people who love me.',
  'The less you want, the more you love.',
  'Never stop smiling!',
  'Learning to ignore things is one of the great paths to inner peace.']

var author = ['Marcie', 'Lucy', 'Charlie Brown', 'Snoopy', 'Snoopy', 'Lucy', 'Snoopy', 'Snoopy', 'Snoopy', 'Linus']

var added = 0

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
        quotes.push(quote)
        author.push('Charlie Brown')
      });
  },

  fetch() {
    let editor
    let self = this

    var time = setTimeout(function () {
      if (editor = atom.workspace.getActiveTextEditor()) {
        let l = quotes.length
        if (l === 0) {
          atom.notifications.addWarning('No quotes found :(')
        } else {
          let position = Math.floor(Math.random() * l)
          let quote = this.format(position)
          editor.insertText(quote)
          atom.notifications.addSuccess('Quote added')
          added = 1
        }
      }
    }, 10000);

    let selection = 'https://www.goalcast.com/2018/02/22/12-charlie-brown-quotes/'

    this.download(selection).then((html) => {
      self.scrape(html)
      clearTimeout(time)
      this.getquote()
    }).catch((error) => {
      console.log(error)
      atom.notifications.addWarning(error.reason)
    })

  },

  getquote() {
    if(added == 1)
      return

    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let l = quotes.length
      let position = Math.floor(Math.random() * l)
      let quote = this.format(position)
      editor.insertText(quote)
      atom.notifications.addSuccess('Quote added')
    }
  },

  format(position) {
    quote = quotes[position]
    author = author[position]

    let length_quote = quote.length
    let length_author = author.length
    let string = ""
    var i

    for(i = 0; i < 73; i++){
      string = string + '/'
    }
    string = string + '//\n// '

    for(i = 0; i < 70; i++){
      string = string + ' '
    }
    string = string + '//\n// '

    var cursor_position = 0
    var word = ''
    var length_word

    for(i = 0; i < length_quote; i++){

      if(quote[i] === ' ' || i == length_quote-1){
        length_word = word.length

        if(i == length_quote - 1){
          word = word + quote[i]
          cursor_position++
        }

        if(cursor_position + length_word < 70){
          string = string + word

          if(cursor_position + length_word != 69){
            string = string + ' '
            cursor_position++
          }

          cursor_position = cursor_position + length_word
          word = ''
        }
        else{
          for(; cursor_position <= 70; cursor_position++){
            string = string + ' '
          }
          string = string + '//\n// '
          cursor_position = length_word
          string = string + word
          string = string + ' '
          cursor_position++
          word = ''
        }
      }
      else{
        word = word + quote[i]
      }
    }
    for(; cursor_position < 69; cursor_position++){
      string = string + ' '
    }
    string = string + '//\n// '

    for(i = 0; i < 55 - length_author; i++){
      string = string + ' '
    }
    string = string + '- '
    string = string + author

    for(i = 57; i < 70; i++){
      string = string + ' '
    }
    string = string + '//\n// '

    for(i = 0; i < 70; i++){
      string = string + ' '
    }
    string = string + '//\n//'

    for(i = 0; i < 73; i++){
      string = string + '/'
    }

    return string
  }

};
