// ==UserScript==
// @name        delete-all-comments
// @description Delete all comments from a given author
// @namespace   Violentmonkey Scripts
// @match       https://github.com/DataDog/*/pull/*
// @grant       none
// @version     1.1
// @author      kamaradclimber
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL   https://raw.githubusercontent.com/kamaradclimber/userscript-github/master/deleteallcomments.user.js
// @downloadURL https://raw.githubusercontent.com/kamaradclimber/userscript-github/master/deleteallcomments.user.js
// ==/UserScript==


/*
 * This script is intended to be used in the PR page of a github repository.
 * It will add a "Delete all from author" button to each comment in the PR.
 * When you click on the button, it will delete all comments from the author of the clicked comment.
 */


(function() {
  'use strict';
  console.log("Loading delete-all-comment code");
  uglySleep(300);

  // don’t delete by default, you can uncomment this to make a quick delete if necessary
  // deleteAllComments("cit-pr-commenter");

  watchAnyMenuOpen();
})();

function findAuthor(comment) {
  var authorElements = $(comment).find(".author");
  if (authorElements.length != 1) {
    return ""
  }
  var author = authorElements[0].text;
  return author;
}

function uglySleep(ms) {
  var start = new Date().getTime(), expire = start + ms;
  while (new Date().getTime() < expire) { }
  return;
}

function watchAnyMenuOpen() {
  var comments = jQuery(".timeline-comment-header");
  console.log(`Found ${comments.length} comments`);



  comments.each(function(idx, comment) {
    var author = findAuthor(comment);
    if (author == "") {
      console.log(`Skipping this comment since it has no info about author`);
      return
    }
    // addButton is called when we click on timeline-comment-action and adds a new "deleteAllComments" button
    var addButton = function() {
      var callback = (mutationList, observer) => {
        var btns = $(comment).find(".menu-item-danger");
        // we expect to have at least one "dangerous button"
        if (btns.length > 0) {
          observer.disconnect();
          var $newButton = $(`<button type="button" class="dropdown-item btn-link js-comment-edit-button" role="menuitem" aria-label="Delete all from author">Delete all from author</button>`)
          $newButton.click(function() {return deleteAllComments(author)})
          $(comment).find(".dropdown-menu").append($newButton)
        }
      };
      var observer = new MutationObserver(callback);
      observer.observe(comment, {attributes: true, childList: true, subtree: true});
    }
    $($(comment).find(".timeline-comment-action")).click(addButton);
  })
}

// deleteAllComments delete all comments from a given author
function deleteAllComments(targetAuthor) {
  var comments = jQuery(".timeline-comment-header");

  console.log(`Found ${comments.length} comments`);
  comments.each(function(idx, comment) {
    var author = findAuthor(comment);
    if (author == "") {
      console.log(`Skipping this comment since it has no info about author`);
      return
    }
    if (author == targetAuthor) {
      console.log("Will try to delete the comment");
      $($(comment).find(".timeline-comment-action")).click();
      var callback = (mutationList, observer) => {
        console.log("Mutation callback called");
        var btns = $(comment).find(".menu-item-danger");
        // we expect to have at least one "dangerous button"
        if (btns.length > 0) {
          observer.disconnect();
          // Avoid confirmation when clicking the delete button
          // btns[0].removeAttribute("data-confirm");
          btns[0].click();
        }
      };
      var observer = new MutationObserver(callback);
      observer.observe(comment, {attributes: true, childList: true, subtree: true});
    } else {
      console.log(`Author is ${author}`)
    }

  })
}


