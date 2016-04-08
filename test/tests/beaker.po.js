/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var _ = require('underscore');

var BeakerPageObject = function() {

  this.EC = protractor.ExpectedConditions;
  this.baseURL = 'http://localhost:8801/';
  this.mainmenu = element.all(by.repeater('m in getMenus()'));
  //jscs:disable
  this.submenu = element.all(by.repeater("item in getMenuItems() | filter:isHidden | orderBy:'sortorder'"))
  //jscs:enable
    .filter(function(e, i) { return e.isDisplayed(); });

  this.waitForInstantiationCells = function() {
    // First wait for the modal to show up when opening a URL
    browser.wait(function() {
      return element(by.css('.modal-dialog')).isDisplayed()
      .then(function(v) {
        return v;
      })
      .thenCatch(function() {
        return false;
      });
    }, 100000);

    // wait for the modal to close
    return browser.wait(function() {
      return element(by.css('.modal-dialog')).isDisplayed()
      .then(function(v) {
        return false;
      })
      .thenCatch(function() {
        return true;
      });
    }, 100000);
  };

  this.openFile = function(path) {
    this.openMenuAtIndex(0);

    browser.sleep(1000); // mouseMove happens too fast and the menu doesnt display sometimes. Couldn't find a better solution.
    browser.actions().mouseMove(element(by.css('#open-menuitem'))).perform();

    element(by.css('a[title="Open a bkr notebook file"]')).click();
    browser.wait(function() {
      return element(by.css('input.form-control')).sendKeys(path)
        .then(function() {
          return true;
        })
        .thenCatch(function() {
          return false;
        });
    }, 100000);

    return element(by.css('.modal-submit')).click();
  };

  this.waitUntilGraphOutputPresent = function() {
    return browser.wait(function() {
      return element(by.css('bk-output-display[type="Plot"]')).isDisplayed()
      .then(function() {
        return true;
      })
      .thenCatch(function() {
        return false;
      });
    }, 100000);
  };

  this.openMenuAtIndex = function(index) {
    return this.mainmenu.get(index).element(by.css('.dropdown-toggle')).click();
  };

  this.toggleLanguageCellMenu = function(opts) {
    return element.all(by.css('.dropdown-toggle bk-language-logo'))
    .get(opts.cellIndex).click();
  };

  this.isLanguageCellMenuOpen = function() {
    return browser.executeScript('return $(".inputcellmenu:visible").length > 0');
  };

  this.toggleCellMenu = function(opts) {
    return element.all(by.css('.bkcell .toggle-menu .dropdown-promoted'))
    .get(opts.cellIndex)
    .click();
  };

  this.toggleAdvancedMode = function() {
    return element(by.css('.view-menu'))
    .click()
    .then(element(by.partialLinkText('Advanced Mode')).click);
  };

  this.setNormalEditMode = function() {
    this.setEditMode().then(element(by.css('#normal-edit-mode-menuitem')).click);
  };

  this.setEmacsEditMode = function() {
    this.setEditMode().then(element(by.css('#emacs-edit-mode-menuitem')).click);
  };

  this.setVimEditMode = function () {
    this.setEditMode().then(element(by.css('#vim-edit-mode-menuitem')).click);
  };

  this.setSublimeEditMode = function() {
    this.setEditMode().then(element(by.css('#sublime-edit-mode-menuitem')).click);
  };

  this.setEditMode = function() {
    element(by.css('.notebook-menu')).click();
    return browser.actions().mouseMove(element(by.css('#edit-mode-menuitem'))).perform();
  };

  this.isCellMenuOpen = function(opts) {
    return element.all(by.css('.bkcell .open.toggle-menu.bkr'))
    .get(opts.cellIndex)
    .isDisplayed()
    .then(function() {
      return true;
    })
    .thenCatch(function() {
      return false;
    });
  };

  this.createMarkdownCell = function(text) {
    return element(by.css('bk-new-cell-menu .dropdown-toggle'))
    .click()
    .then(function() {
      return element(by.css('.insert-text'));
    })
    .then(function(el) {
      return el.click();
    })
    .then(function() {
      return this.setCellInput(text);
    }.bind(this));
  }.bind(this);

  this.newEmptyNotebook = element(by.className('new-empty-notebook'));

  this.fileMenu = element(by.className('file-menu'));
  this.viewMenu = element(by.className('view-menu'));
  this.notebookMenu = element(by.className('notebook-menu'));
  this.helpMenu = element(by.className('help-menu'));

  this.languageManagerMenuItem = element(by.className('language-manager-menuitem'));
  this.runAllCellsMenuItem = element(by.className('run-all-cells-menuitem'));
  this.closeMenuItem = element(by.className('close-menuitem'));

  this.closeNotebook = function() {
    return this.fileMenu.click()
    .then(this.closeMenuItem.click)
    .then(this.modalDialogNoButton.click)
    .thenCatch(function(e) {
      //if there has been no change do not fail here;
    });
  }.bind(this);

  this.codeCell = function(index) {
    return _.extend(element.all(by.css('.bkcell.code')).get(index),
                    require('./mixins/cell.js'));
  };
  this.waitForPlugin = function(plugin) {
    browser.wait(function() {
      var deferred = protractor.promise.defer();
      this.languageManagerButtonActive(plugin).isPresent()
        .then(function(result) {
          deferred.fulfill(result);
        });
      return deferred.promise;
    }.bind(this));
  };

  this.readMarkdownCell = function() {
    return this.getCellInput();
  };

  this.activateLanguageInManager = function(language) {
    this.languageManagerButtonActive(language).isPresent()
    .then(function(isActive) {
      if (!isActive) {
        return this.languageManagerButton(language).click();
      }
    }.bind(this));
  };

  this.languageManager = element(by.className('plugin-manager'));
  this.languageManagerButtonKnown = function(language) {
    return element(by.css('.plugin-manager .' + language + ' .plugin-known'));
  };
  this.languageManagerButtonActive = function(language) {
    return element(by.css('.plugin-manager .' + language + ' .plugin-active'));
  };
  this.languageManagerButton = function(language) {
    return element(by.css('.plugin-manager .' + language));
  };

  this.getEvaluateButton = function() {
    return element(by.className('evaluate-script'));
  };

  this.languageManagerCloseButton = element(by.className('language-manager-close-button'));
  this.insertCellButton = element(by.className('insert-cell'));
  this.deleteCellButton = element(by.className('delete-cell'));
  this.evaluateButton = this.getEvaluateButton();
  this.modalDialogYesButton = element(by.css('.modal .yes'));
  this.modalDialogNoButton = element(by.css('.modal .no'));
  this.modalDialogCancelButton = element(by.css('.modal .cancel'));

  this.cellEvaluatorMenu = element(by.css('.code-cell-area .cell-evaluator-menu'));
  this.cellEvaluatorMenuItem = function(language) {
    return element(by.css('.code-cell-area .' + language + '-menuitem'));
  };
  this.cellEvaluatorDisplay = element(by.css('.code-cell-area .cell-evaluator-menu b'));

  //Functions for access to plot elements


  this.scrollToCodeCellOutput = function (index) {
    return browser.executeScript("$('.code-cell-output')[" + index + "].scrollIntoView();");
  };

  this.getCodeCellOutputByIndex = function (index) {
    return element.all(by.css('.code-cell-output')).get(index);
  };

    this.getCodeCellOutputCombplotTitle = function (codeCellOutputIdx) {
    return this.getCodeCellOutputByIndex(codeCellOutputIdx).element(by.id('combplotTitle')).getText();
  };

  this.getCodeCellOutputContainerTitle = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getCodeCellOutputByIndex(codeCellOutputIdx)
      .all(by.id("plotTitle"))
      .get(containerIdx).getText();
  };

  this.getCodeCellOutputContainerYLabel = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainer(codeCellOutputIdx, containerIdx).element(by.id('ylabel')).getText();
  };

  this.getCodeCellOutputContainerYRLabel = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainer(codeCellOutputIdx, containerIdx).element(by.id('yrlabel')).getText();
  };

  this.getCodeCellOutputContainerXLabel = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainer(codeCellOutputIdx, containerIdx).element(by.id('xlabel')).getText();
  };

  this.getPlotLegendContainer = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    return this.getCodeCellOutputByIndex(codeCellOutputIdx).all(By.css('.plot-plotlegendcontainer')).get(containerIdx);
  };

  this.getPlotSvg= function (codeCellOutputIdx, containerIdx) {
    return this.getPlotLegendContainer(codeCellOutputIdx, containerIdx).element(By.id('svgg'));
  };

  this.getPlotMaing= function (codeCellOutputIdx, containerIdx) {
    return this.getPlotSvg(codeCellOutputIdx, containerIdx).element(By.id('maing'));
  };

  this.getPlotLabelg= function (codeCellOutputIdx, containerIdx) {
    return this.getPlotSvg(codeCellOutputIdx, containerIdx).element(By.id('labelg'));
  };

  this.getPlotSvgElementByIndex= function (codeCellOutputIdx, containerIdx, elementIndex) {
    return this.getPlotSvg(codeCellOutputIdx, containerIdx).all(by.css("#maing > g")).get(elementIndex);
  };

  //End Functions for access to plot elements

  //CodeMirror API. See for information https://sharpkit.net/help/SharpKit.CodeMirror/SharpKit.CodeMirror/CodeMirror/

  this.setCellInput = function(code) {
    return browser.executeScript("$('.CodeMirror')[0].CodeMirror.setValue('" + code + "')");
  };

  this.getCellInput = function() {
    return browser.executeScript('return $(".CodeMirror")[0].CodeMirror.getValue()');
  };

  //Set the selection range. start and end should be {line, ch} objects.
  this.setCellInputSelection = function(start, end) {
    return browser.executeScript('$(".CodeMirror")[0].CodeMirror.setSelection({' + start.line + ', ' + start.ch + '}, {' + start.line + ', ' + start.ch + '})');
  };

  //Set the cursor position. You can either pass a single {line, ch} object, or the line and the
  // character as two separate parameters.
  this.setCellInputCursor = function(pos) {
    return browser.executeScript('$(".CodeMirror")[0].CodeMirror.setCursor({' + pos.line + ', ' + pos.ch + '})');
  };

  //start is a boolean indicating whether the start or the end of the selection must be retrieved.
  //If it is not given, the current cursor pos, i.e. the side of the selection that would move if
  //you pressed an arrow key, is chosen. A {line, ch} object will be returned.
  this.getCellInputCursor = function() {
    return browser.executeScript('return $(".CodeMirror")[0].CodeMirror.getCursor()');
  };

  //end CodeMirror API

  this.toggleOutputCellExpansion = function() {
    return element(by.css('.toggle-menu .expand-contract')).click();
  };

  this.evaluateCell = function() {
    var self = this;

    return browser.wait(function() {
      return self.getEvaluateButton().click()
      .then(function() {
        return true;
      })
      .thenCatch(function() {
        return false;
      });
    }, 100000);
  };

  this.insertNewCell = function() {
    element(by.css('bk-new-cell-menu')).click();
    return this.insertCellButton.click();
  };

  this.openSection = function() {
    return element(by.css('.bksectiontoggleplus')).click();
  };

  this.getCellOutput = function() {
    return element(by.css('bk-output-display > div'));
  };

  this.getLoadingIndicator = function() {
    return element(by.css('.navbar-text > i'));
  };

  this.waitForCellOutput = function(plugin) {
    var self = this;

    browser.wait(function() {
      return self.getCellOutput().isPresent()
      .then(function() {
        return true;
      })
      .thenCatch(function() {
        return false;
      });
    }, 10000);

    return browser.wait(function() {
      return self.getCellOutput().getText()
      .then(function(txt) {
        return txt.indexOf('Elapsed:') === -1;
      })
      .thenCatch(function() {
        return false;
      });
    }, 10000);
  };


  this.waitUntilLoadingFinished = function() {
    var self = this;
    return browser.wait(function() {
      return self.getLoadingIndicator().isPresent()
        .then(function(present) {
        return !present;
      })
      .thenCatch(function() {
        return false;
      });
    }, 100000);
  };

  this.waitUntilLoadingIndicator = function() {
    browser.wait(this.EC.presenceOf($('.navbar-text > i')), 10000);
  };

  this.waitUntilLoadingCellOutput = function() {
    browser.wait(this.EC.presenceOf($('bk-code-cell-output')), 10000);
  }

  this.checkPlotIsPresent = function (codeCellOutputIdx, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    this.scrollToCodeCellOutput(codeCellOutputIdx);
    expect(this.getPlotMaing(codeCellOutputIdx, containerIdx).isPresent()).toBe(true);
  };


  this.hasClass =  function  (element, cls) {
    return element.getAttribute('class').then(function (classes) {
      return classes && classes.split(' ').indexOf(cls) !== -1;
    });
  };

  this.checkClass =  function (element, expectedClass){
    expect(this.hasClass(element, expectedClass)).toBe(true);
  };

  this.checkCount =  function (elements, expectedCount){
    expect(elements.count()).toBe(expectedCount);
  };

  this.checkLegendIsPresent = function (codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    expect(this.getPlotLegendContainer(codeCellOutputIdx, containerIdx).element(By.css('.plot-legend')).isPresent()).toBe(true);
  };

  this.checkSize = function (element, width, height) {
    expect(element.getSize().then(function (size) {
      return size.height
    })).toBe(height);
    expect(element.getSize().then(function (size) {
      return size.width
    })).toBe(width);
  };


  this.checkPlotLegentdLabel = function (codeCellOutputIdx, containerIdx, legentdLabelIndex, text) {
    expect(this.getPlotLegendContainer(codeCellOutputIdx, containerIdx)
      .all(By.tagName('label')).get(legentdLabelIndex).getText()).toBe(text);
  }

  this.checkLegendIsPresentByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    expect(this.getPlotLegendContainerByIdCell(codeCellOutputId, containerIdx).element(By.css('.plot-legend')).isPresent()).toBe(true);
  };

  this.getCodeCellOutputCombplotTitleByIdCell = function (codeCellOutputId) {
    return this.getCodeCellOutputByIdCell(codeCellOutputId).element(by.id('combplotTitle')).getText();
  };

  this.getCodeCellOutputContainerYLabelByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainerByIdCell(codeCellOutputId, containerIdx).element(by.id('ylabel')).getText();
  };

  this.getCodeCellOutputContainerTitleByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getCodeCellOutputByIdCell(codeCellOutputId)
        .all(by.id("plotTitle"))
        .get(containerIdx).getText();
  };

  this.getCodeCellOutputContainerXLabelByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainerByIdCell(codeCellOutputId, containerIdx).element(by.id('xlabel')).getText();
  };

  this.getCodeCellOutputContainerYRLabelByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;

    return this.getPlotLegendContainerByIdCell(codeCellOutputId, containerIdx).element(by.id('yrlabel')).getText();
  };

  this.scrollToCodeCellOutputByIdCell = function (idCell) {
    return browser.executeScript("$('[cell-id=" + idCell +"]')[0].scrollIntoView();");
  };

  this.getCodeCellOutputByIdCell = function (idCell) {
    return element.all(by.css('[cell-id=' + idCell + ']')).get(0);
  };

  this.checkPlotIsPresentByIdCell = function (codeCellOutputId, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    this.scrollToCodeCellOutputByIdCell(codeCellOutputId);
    expect(this.getPlotMaingByIdCell(codeCellOutputId, containerIdx).isPresent()).toBe(true);
  };

  this.getPlotMaingByIdCell = function (codeCellOutputId, containerIdx) {
    return this.getPlotSvgByIdCell(codeCellOutputId, containerIdx).element(By.id('maing'));
  };

  this.getPlotSvgByIdCell = function (codeCellOutputId, containerIdx) {
    return this.getPlotLegendContainerByIdCell(codeCellOutputId, containerIdx).element(By.id('svgg'));
  };

  this.getPlotLegendContainerByIdCell = function (codeCellOutputId, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    return this.getCodeCellOutputByIdCell(codeCellOutputId).all(By.css('.plot-plotlegendcontainer')).get(containerIdx);
  };

  this.getPlotSvgElementByIndexByIdCell = function (codeCellOutputId, containerIdx, elementIndex) {
    return this.getPlotSvgByIdCell(codeCellOutputId, containerIdx).all(by.css("#maing > g")).get(elementIndex);
  };

  this.checkDtContainer = function(codeCellOutputIdx, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    this.scrollToCodeCellOutput(codeCellOutputIdx);
    expect(this.getDtContainer(codeCellOutputIdx, containerIdx).isPresent()).toBe(true);
  }

  this.checkDtContainerByIdCell = function(idCell, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    this.scrollToCodeCellOutputByIdCell(idCell);
    expect(this.getDtContainerByIdCell(idCell, containerIdx).isPresent()).toBe(true);
  }

  this.getDtContainer = function(codeCellOutputIdx, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    return this.getCodeCellOutputByIndex(codeCellOutputIdx).all(By.css('.dtcontainer')).get(containerIdx);
  }

  this.getDtContainerByIdCell = function(idCell, containerIdx) {
    if (!containerIdx)
      containerIdx = 0;
    return this.getCodeCellOutputByIdCell(idCell).all(By.css('.dtcontainer')).get(containerIdx);
  }

  this.getDataTablesScrollHead = function(codeCellOutputIdx, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    return this.getDtContainer(codeCellOutputIdx, containerIdx).element(By.css('.dataTables_scrollHead'));
  }

  this.getDataTablesScrollHeadByIdCell = function(idCell, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    return this.getDtContainerByIdCell(idCell, containerIdx).element(By.css('.dataTables_scrollHead'));
  }

  this.getDataTablesScrollBody = function(codeCellOutputIdx, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    return this.getDtContainer(codeCellOutputIdx, containerIdx).element(By.css('.dataTables_scrollBody'));
  }

  this.getDataTablesScrollBodyByIdCell = function(idCell, containerIdx){
    if (!containerIdx)
      containerIdx = 0;
    return this.getDtContainerByIdCell(idCell, containerIdx).element(By.css('.dataTables_scrollBody'));
  }

  this.getDataTablesTBody = function(codeCellOutputIdx){
    return this.getDataTablesScrollBody(codeCellOutputIdx).all(By.css('tbody > tr'));
  }

  this.getDataTablesTBodyByIdCell = function(idCell){
    return this.getDataTablesScrollBodyByIdCell(idCell).all(By.css('tbody > tr'));
  }

  this.checkDataTableHead = function(codeCellOutputIdx, headLabels){
    expect(this.getDataTablesScrollHead(codeCellOutputIdx).getText()).toBe(headLabels);
  }

  this.getDataTablesTHeadByIdCell = function(idCell){
    return this.getDataTablesScrollHeadByIdCell(idCell).all(By.css('thead > tr'));
  }

  this.checkDataTableHeadByIdCell = function(idCell, headLabels){
    expect(this.getDataTablesScrollHeadByIdCell(idCell).getText()).toBe(headLabels);
  }

  this.checkDataTableBody = function(codeCellOutputIdx, rowsCount, firstRow){
    var tBody = this.getDataTablesTBody(codeCellOutputIdx);
    expect(tBody.count()).toBe(rowsCount);
    expect(tBody.get(0).getText()).toBe(firstRow);
  }

  this.checkDataTableBodyByIdCell = function(idCell, rowsCount, firstRow){
    var tBody = this.getDataTablesTBodyByIdCell(idCell);
    expect(tBody.count()).toBe(rowsCount);
    expect(tBody.get(0).getText()).toBe(firstRow);
  }

  this.checkCellOutputText = function(codeCellOutputIdx, outputText){
    expect(this.getCodeCellOutputByIndex(codeCellOutputIdx).element(By.css('pre')).getText()).toBe(outputText);
  }

  this.checkCellOutputTextByIdCell = function(idCell, outputText){
    expect(this.getCodeCellOutputByIdCell(idCell).element(By.css('pre')).getText()).toBe(outputText);
  }

  this.checkCellOutputSubTextByIdCell = function(idCell, outputText, inxStart, lenght){
    expect(this.getCodeCellOutputByIdCell(idCell).element(By.css('pre')).isPresent()).toBe(true);
    this.getCodeCellOutputByIdCell(idCell).element(By.css('pre')).getText()
        .then(function(value){
          expect(value.substring(inxStart, lenght)).toBe(outputText);
        });
  }

  this.checkImageByIdCell = function(idCell){
    expect(this.getCodeCellOutputByIdCell(idCell).element(By.css('img')).isPresent()).toBe(true);
    this.getCodeCellOutputByIdCell(idCell).element(By.css('img')).getAttribute('src')
        .then(function(attr){
          expect(attr.substring(0, 21)).toBe('data:image/png;base64');
        });
  }

  this.checkSubString = function(strPromise, toBeStr, indxStart, lenght){
    strPromise.getText().then(function(value){
      expect(value.substring(indxStart, lenght)).toBe(toBeStr);
    });
  }

};
module.exports = BeakerPageObject;
