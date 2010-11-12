YUI.add('gallery-tagcloud', function(Y) {


    function highlight(node, text) {
        var skip = 0, pos, i, spannode, middlebit, endbit, middleclone;

        if (node.nodeType === 3) {
            pos = node.data.toUpperCase().indexOf(text);
            if (pos >= 0) {
                if (node.parentNode.nodeName === "SPAN") {
                    node.parentNode.className = "highlight";
                } else {
                    spannode = Y.Node.getDOMNode(
                        Y.Node.create('<span />')
                            .addClass("highlight"));
                    middlebit = node.splitText(pos);
                    endbit = middlebit.splitText(text.length);
                    middleclone = middlebit.cloneNode(true);
                    spannode.appendChild(middleclone);
                    middlebit.parentNode.replaceChild(spannode, middlebit);
                    skip = 1;
                }
            }
        } else if (node.nodeType === 1 &&
            node.childNodes &&
            !/(script|style)/i.test(node.tagName)) {
            for (i = 0; i < node.childNodes.length; i += 1) {
                i += highlight(node.childNodes[i], text);
            }
        }

        return skip;
    }

    function removeHighlight(node) {
        Y.all("span.highlight").removeClass("highlight");
        return node;
    }

    Y.Node.addMethod("highlight", highlight);
    Y.Node.addMethod("removeHighlight", removeHighlight);
    Y.NodeList.importMethod(Y.Node.prototype, "highlight");
    Y.NodeList.importMethod(Y.Node.prototype, "removeHighlight");

    function tagCloud(node, outId, options) {
        var out, cloud = {}, cl = [], max = 0, i, n, t,
            tags = Y.one(node).get("text").replace(/\W/g, ' ').split(' ');

        outId = outId || "#dynacloud";

        options = options || {};
        options.max = options.max || 20;
        options.scale = options.scale || 4;
        options.sort = options.sort === undefined ? true : options.sort;

        n = tags.length;
        for (i = 0; i < n; i += 1) {
            t = tags[i].toLowerCase();
            if (t) {
                if (typeof cloud[t] === 'undefined') {
                    cloud[t] = { count: 1, el: t };
                } else {
                    cloud[t].count += 1;
                }
                max = Math.max(cloud[t].count, max);
            }
        }

        for (t in cloud) {
            if (cloud[t]) {
                cl[cl.length] = cloud[t];
            }
        }

        if (options.sort) {
            cl.sort(function (a, b) {
                if (a.el < b.el) {
                    return -1;
                } else {
                    return 1;
                }
            });
        }

        out = Y.one(outId);
        if (out === null) {
            Y.one("body").append('<p id="dynacloud"><\/p>');
            out = Y.one(outId);
        }

        out.get('children').remove(true);

        n = Math.min(options.max, cl.length);
        for (i = 0; i < n; i += 1) {
            out.append('<a href="#' + cl[i].el + '" style="font-size: ' +
                Math.ceil((cl[i].count / max) * options.scale) +
                'em"><span>' + cl[i].el + '</span></a> &nbsp; ');
        }

        Y.on("click", function (e) {
            var el = e.currentTarget;
            Y.one(this)
                .removeHighlight()
                .highlight(el.get('text').toUpperCase());
        }, outId + " a", node);

    }

    Y.Node.addMethod("tagCloud", tagCloud);



}, 'gallery-2010.11.03-19-46' ,{requires:['node']});