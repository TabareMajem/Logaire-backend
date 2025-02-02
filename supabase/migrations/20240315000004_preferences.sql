-- Create user preferences tables
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  monitoring_config JSONB NOT NULL DEFAULT '{
    "theme": "light",
    "refreshInterval": 30000,
    "defaultTimeRange": "1h",
    "defaultMetrics": ["cpu", "memory"],
    "notifications": {
      "email": true,
      "browser": true,
      "slack": false
    },
    "dashboardLayout": {
      "panels": []
    }
  }',
  alert_preferences JSONB NOT NULL DEFAULT '{
    "emailNotifications": true,
    "browserNotifications": true,
    "notificationThresholds": {
      "low": true,
      "medium": true,
      "high": true
    },
    "quietHours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00",
      "timezone": "UTC"
    }
  }',
  visualization_preferences JSONB NOT NULL DEFAULT '{
    "chartType": "line",
    "showLegend": true,
    "colorScheme": "default",
    "aggregation": {
      "enabled": true,
      "method": "average",
      "interval": "5m"
    },
    "thresholds": {
      "warning": {
        "enabled": true,
        "color": "#FFA500"
      },
      "critical": {
        "enabled": true,
        "color": "#FF0000"
      }
    }
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create dashboard layouts table
CREATE TABLE user_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  layout JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- Create notification settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  channel TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, channel)
);

-- Create indexes
CREATE INDEX idx_user_dashboard_layouts_user ON user_dashboard_layouts(user_id);
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_channel ON notification_settings(channel) WHERE enabled = true;

-- Create triggers
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_layouts_updated_at
    BEFORE UPDATE ON user_dashboard_layouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 