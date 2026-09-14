# Generated manually to add new fields to AnomalyEvent

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_anomalyevent'),
    ]

    operations = [
        migrations.AddField(
            model_name='anomalyevent',
            name='anomaly_type',
            field=models.CharField(default='UNKNOWN', max_length=50),
        ),
        migrations.AddField(
            model_name='anomalyevent',
            name='confidence',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='anomalyevent',
            name='score',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='anomalyevent',
            name='severity',
            field=models.CharField(default='MEDIUM', max_length=20),
        ),
        migrations.AddField(
            model_name='anomalyevent',
            name='status',
            field=models.CharField(default='active', max_length=20),
        ),
    ]
