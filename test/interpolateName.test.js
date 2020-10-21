"use strict";

const loaderUtils = require("../");

describe("interpolateName()", () => {
  function run(tests) {
    tests.forEach((test) => {
      const args = test[0];
      const expected = test[1];
      const message = test[2];
      it(message, () => {
        const result = loaderUtils.interpolateName.apply(loaderUtils, args);
        if (typeof expected === "function") {
          expected(result);
        } else {
          expect(result).toBe(expected);
        }
      });
    });
  }

  [
    [
      "/app/js/javascript.js",
      "js/[contenthash].script[ext]",
      "test content",
      "js/a69899814931280e2f52.script.js",
    ],
    [
      "/app/js/javascript.js",
      "js/[contenthash].script[ext]",
      "test content",
      "js/a69899814931280e2f52.script.js",
    ],
    [
      "/app/page.html",
      "html-[contenthash:6].html",
      "test content",
      "html-a69899.html",
    ],
    [
      "/app/page.html",
      "html-[contenthash:6].html",
      "test content",
      "html-a69899.html",
    ],
    ["/app/flash.txt", "[contenthash]", "test content", "a69899814931280e2f52"],
    [
      "/app/img/image.png",
      "[sha512:contenthash:base64:7][ext]",
      "test content",
      "2BKDTjl.png",
    ],
    [
      "/app/img/image.png",
      "[sha512:contenthash:base64:7][ext]",
      "test content",
      "2BKDTjl.png",
    ],
    [
      "/app/dir/file.png",
      "[path][name][ext]?[contenthash]",
      "test content",
      "/app/dir/file.png?a69899814931280e2f52",
    ],
    [
      "/vendor/test/images/loading.gif",
      (path) => path.replace(/\/?vendor\/?/, ""),
      "test content",
      "test/images/loading.gif",
    ],
    [
      "/pathWith.period/filename.js",
      "js/[name][ext]",
      "test content",
      "js/filename.js",
    ],
    [
      "/pathWith.period/filenameWithoutExt",
      "js/[name][ext]",
      "test content",
      "js/filenameWithoutExt",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name]__modalTitle___[sha1:contenthash:hex:4]",
      "test content",
      "modal__modalTitle___1eeb",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name].[md5:contenthash:base64:20][ext]",
      "test content",
      "modal.1n8osQznuT8jOAwdzg_n.css",
    ],
    // Should not interpret without `hash` or `contenthash`
    [
      "/lib/components/modal/modal.css",
      "[name].[md5::base64:20][ext]",
      "test content",
      "modal.[md5::base64:20].css",
    ],
    [
      "/app/js/javascript.js?foo=bar",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?foo=bar&bar=baz",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js?foo=bar&bar=baz",
    ],
    [
      "/app/js/javascript.js?foo",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js?foo",
    ],
    [
      "/app/js/javascript.js?",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js",
    ],
    [
      "/app/js/javascript.js?a",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js?a",
    ],
    [
      "/app/js/javascript.js?foo=bar#hash",
      "js/[contenthash].script[ext][query]",
      "test content",
      "js/a69899814931280e2f52.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?foo=bar#hash",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).toBeDefined();

        return "js/[contenthash].script[ext][query]";
      },
      "test content",
      "js/a69899814931280e2f52.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?a",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).toBeDefined();

        return "js/[contenthash].script[ext][query]";
      },
      "test content",
      "js/a69899814931280e2f52.script.js?a",
    ],
    [
      "/app/js/javascript.js",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).not.toBeDefined();

        return "js/[contenthash].script[ext][query]";
      },
      "test content",
      "js/a69899814931280e2f52.script.js",
    ],
    [
      "/app/js/javascript.js?",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).not.toBeDefined();

        return "js/[contenthash].script[ext][query]";
      },
      "test content",
      "js/a69899814931280e2f52.script.js",
    ],
  ].forEach((test) => {
    it("should interpolate " + test[0] + " " + test[1], () => {
      let resourcePath = "";
      let resourceQuery = "";

      const queryIdx = test[0].indexOf("?");

      if (queryIdx >= 0) {
        resourcePath = test[0].substr(0, queryIdx);
        resourceQuery = test[0].substr(queryIdx);
      } else {
        resourcePath = test[0];
      }

      const interpolatedName = loaderUtils.interpolateName(
        { resourcePath, resourceQuery },
        test[1],
        { content: test[2] }
      );

      expect(interpolatedName).toBe(test[3]);
    });
  });

  [
    "sha1fakename",
    "9dxfakename",
    "RSA-SHA256-fakename",
    "ecdsa-with-SHA1-fakename",
    "tls1.1-sha512-fakename",
  ].forEach((hashName) => {
    it("should pick hash algorithm by name " + hashName, () => {
      expect(() => {
        const interpolatedName = loaderUtils.interpolateName(
          {},
          "[" + hashName + ":contenthash:base64:10]",
          { content: "a" }
        );
        // if for any reason the system we're running on has a hash
        // algorithm matching any of our bogus names, at least make sure
        // the output is not the unmodified name:
        expect(interpolatedName[0]).not.toBe("[");
      }).toThrow(/digest method not supported/i);
    });
  });

  run([
    [
      [{}, "", { content: "test string" }],
      "2e06edd4f1623268c5a5",
      "should interpolate default tokens",
    ],
    [
      [{}, "[contenthash:base64]", { content: "test string" }],
      "2LIG3oc1uBNmwOoL7kXg",
      "should interpolate [contenthash] token with options",
    ],
    [
      [{}, "[unrecognized]", { content: "test string" }],
      "[unrecognized]",
      "should not interpolate unrecognized token",
    ],
  ]);

  describe("no loader context", () => {
    const loaderContext = {};
    run([
      [[loaderContext, "[ext]", {}], "", "should interpolate [ext] token"],
      [
        [loaderContext, "[name]", {}],
        "file",
        "should interpolate [name] token",
      ],
      [[loaderContext, "[path]", {}], "", "should interpolate [path] token"],
      [[loaderContext, "[base]", {}], "", "should interpolate [base] token"],
    ]);
  });

  describe("with loader context", () => {
    const loaderContext = { resourcePath: "/path/to/file.exe" };
    run([
      [[loaderContext, "[ext]", {}], ".exe", "should interpolate [ext] token"],
      [
        [loaderContext, "[name]", {}],
        "file",
        "should interpolate [name] token",
      ],
      [
        [loaderContext, "[path]", {}],
        "/path/to/",
        "should interpolate [path] token",
      ],
      [[loaderContext, "[base]", {}], "to", "should interpolate [base] token"],
    ]);
  });

  run([
    [
      [
        {
          resourcePath: "/xyz",
          options: {
            customInterpolateName(str, name, options) {
              return str + "-" + name + "-" + options.special;
            },
          },
        },
        "[name]",
        {
          special: "special",
        },
      ],
      "xyz-[name]-special",
      "should provide a custom interpolateName function in options",
    ],
    [
      [
        {
          resourcePath: "/foo/xyz.png",
        },
        "[1]-[name][ext]",
        {
          regExp: /\/([a-z0-9]+)\/[a-z0-9]+\.png$/,
        },
      ],
      "foo-xyz.png",
      "should support regExp in options",
    ],
  ]);
});
