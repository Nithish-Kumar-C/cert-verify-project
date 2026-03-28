from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('certificates', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='institute',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='institute',
            name='approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]