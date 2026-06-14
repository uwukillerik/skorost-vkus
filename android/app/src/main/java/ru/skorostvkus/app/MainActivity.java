package ru.skorostvkus.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.jcesarmobile.sslskip.SslSkipPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SslSkipPlugin.class);
        super.onCreate(savedInstanceState);

        // Контент не залезает под системные панели — убирает «чёрную полосу» снизу
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        int navColor = Color.parseColor("#fdf8f3");
        getWindow().setNavigationBarColor(navColor);
        getWindow().setStatusBarColor(navColor);

        WindowInsetsControllerCompat insets = new WindowInsetsControllerCompat(
            getWindow(),
            getWindow().getDecorView()
        );
        insets.setAppearanceLightNavigationBars(true);
        insets.setAppearanceLightStatusBars(true);
    }
}
