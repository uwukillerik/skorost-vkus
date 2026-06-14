package ru.skorostvkus.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.jcesarmobile.sslskip.SslSkipPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SslSkipPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
