
/*
 *  Copyright 2017 TWO SIGMA OPEN SOURCE, LLC
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
package com.twosigma.beaker.easyform.formitem.widgets;

import com.twosigma.beaker.easyform.EasyFormComponent;
import com.twosigma.beaker.widgets.selections.SelectMultiple;
import org.junit.Test;

import static com.twosigma.beaker.widgets.TestWidgetUtils.verifyMsgForProperty;
import static java.util.Arrays.asList;

public class RadioButtonComponentWidgetTest extends EasyFormWidgetTest {

  @Test
  public void setValues() throws Exception {
    //given
    String newValue = "2";
    RadioButtonComponentWidget widget = new RadioButtonComponentWidget();
    widget.setValues(asList("1", "2", "3"));
    kernel.clearPublishedMessages();
    //when
    widget.setValue(newValue);
    //then
    verifyMsgForProperty(kernel, SelectMultiple.VALUE, "2");
  }


  @Override
  protected EasyFormComponent createWidget() {
    return new RadioButtonComponentWidget();
  }
}