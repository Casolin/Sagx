package sagx.app

import android.app.Activity
import android.media.projection.MediaProjectionManager
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "ScreenCapture")
class ScreenCapturePlugin : Plugin() {

    private lateinit var projectionManager: MediaProjectionManager

    override fun load() {
        projectionManager =
            activity.getSystemService(Activity.MEDIA_PROJECTION_SERVICE)
                    as MediaProjectionManager
    }

    @PluginMethod
    fun start(call: PluginCall) {
        val intent = projectionManager.createScreenCaptureIntent()
        startActivityForResult(call, intent, "screenRequest")
    }
}