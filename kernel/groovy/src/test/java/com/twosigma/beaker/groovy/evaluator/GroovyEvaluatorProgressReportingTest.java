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
package com.twosigma.beaker.groovy.evaluator;

import com.twosigma.ExecuteCodeCallbackTest;
import com.twosigma.beaker.jupyter.KernelManager;
import com.twosigma.beaker.jvm.object.SimpleEvaluationObject;
import com.twosigma.beaker.KernelTest;
import com.twosigma.beaker.widgets.integers.IntProgress;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import com.twosigma.jupyter.message.Message;

import java.util.List;

import static com.twosigma.beaker.evaluator.EvaluatorResultTestWatcher.waitForResult;
import static com.twosigma.beaker.jupyter.msg.JupyterMessages.COMM_CLOSE;
import static com.twosigma.beaker.jvm.object.SimpleEvaluationObject.EvaluationStatus.FINISHED;
import static com.twosigma.beaker.widgets.TestWidgetUtils.getValueForProperty;
import static com.twosigma.beaker.widgets.TestWidgetUtils.verifyDisplayMsg;
import static com.twosigma.beaker.widgets.TestWidgetUtils.verifyOpenCommMsg;
import static com.twosigma.beaker.widgets.TestWidgetUtils.verifyTypeMsg;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

public class GroovyEvaluatorProgressReportingTest {

  private GroovyEvaluator groovyEvaluator;
  private KernelTest groovyKernel;

  @Before
  public void setUp() throws Exception {
    groovyEvaluator = new GroovyEvaluator("shellId1", "sessionId1");
    groovyKernel = new KernelTest();
    KernelManager.register(groovyKernel);
  }

  @After
  public void tearDown() throws Exception {
    KernelManager.register(null);
  }

  @Test
  public void progressReporting() throws Exception {
    //given
    String code =
            "for ( int i = 0 ; i<5; i++) {\n" +
            "  beaker.showProgressUpdate(\"msg\"+i, i)\n" +
            "}\n" +
            "\"finished\"";
    SimpleEvaluationObject seo = new SimpleEvaluationObject(code, new ExecuteCodeCallbackTest());
    //when
    groovyEvaluator.evaluate(seo, code);
    waitForResult(seo);
    //then
    assertThat(seo.getStatus()).isEqualTo(FINISHED);
    assertThat(seo.getPayload()).isEqualTo("finished");
    verifyProgressReporting(groovyKernel.getPublishedMessages());
  }

  private void verifyProgressReporting(List<Message> messages) {
    assertThat(messages.size()).isEqualTo(14);
    Message layout = messages.get(0);
    Message intProgress = messages.get(1);
    verifyOpenCommMsg(asList(layout, intProgress), IntProgress.MODEL_NAME_VALUE, IntProgress.VIEW_NAME_VALUE);

    verifyDisplayMsg(messages.get(2));

    verifyUpdate(messages.get(3), messages.get(4),0);
    verifyUpdate(messages.get(5), messages.get(6),1);
    verifyUpdate(messages.get(7), messages.get(8),2);
    verifyUpdate(messages.get(9), messages.get(10),3);
    verifyUpdate(messages.get(11), messages.get(12),4);

    Message closeMessage = messages.get(13);
    verifyTypeMsg(closeMessage, COMM_CLOSE);
  }

  private void verifyUpdate(Message value, Message description,int index) {
    assertThat(getValueForProperty(value, IntProgress.VALUE, Integer.class)).isEqualTo(index);
    assertThat(getValueForProperty(description, IntProgress.DESCRIPTION, String.class)).isEqualTo("msg"+index);
  }


}
