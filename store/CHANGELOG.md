# Changelog

## [3.2.2] 2020-06-17
- Updated package versions.
- Improved minifying arguments.

## [3.2.0] 2020-03-18
- Added some better typing for selectors.
- Added a way to pass a debug name to selectors.

## [3.0.0] 2019-08-04
- Moved history store into its own package.

## [2.2.2] 2019-07-14
- Made the tsconfig use strict mode.

## [2.2.0] 2019-07-10
- Filled out some more functionality for the history store, added subscription and fixed some bugs.

## [2.1.1] 2019-07-08
- Refactored how history works, now the store supports the ability to implement history rather that it being built in.
- Added an implementation of history outside of the store.

## [2.0.0] 2019-07-03
- Big refactor
- Changed to using a purely function based reducer system without actions.
- Added history support.
- Is smaller in file size (after building and compressing) than version 1.0.0

## [1.0.0] 2019-07-02
- Initial version
- Has support for class based reducers with actions.
- No history support yet.