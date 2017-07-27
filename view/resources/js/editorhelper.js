function walkback(node, stopAt) {
    if (node.childNodes && node.childNodes.length) { // go to last child
        while (node && node.childNodes.length > 0) {
            node = node.childNodes[node.childNodes.length - 1];
        }
    } else if (node.previousSibling) { // else go to previous node
        node = node.previousSibling;
    } else if (node.parentNode) { // else go to previous branch
        while (node && !node.previousSibling && node.parentNode) {
            node = node.parentNode;
        }
        if (node === stopAt) return;
        node = node.previousSibling;
    } else { // nowhere to go
        return;
    }
    if (node) {
        if (node.nodeType === 3) return node;
        if (node === stopAt) return;
        return walkback(node, stopAt);
    }
    return;
}
function getRealCaretPosition() {
    var sel = window.getSelection(), // current selection
        pos = sel.anchorOffset, // get caret start position
        node = sel.anchorNode; // get the current #text node
    while (node = walkback(node, myContentEditableElement)) {
        pos = pos + node.data.length; // add the lengths of the previous text nodes
    }
    return pos;
}